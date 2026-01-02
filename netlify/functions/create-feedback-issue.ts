import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface FeedbackPayload {
  title: string;
  description: string;
  userEmail?: string;
  category: string;
  url?: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Check for GitHub token
  const githubToken = process.env.GITHUB_TOKEN;
  const githubRepo = process.env.GITHUB_REPO || 'aSipiere/rygonet';

  if (!githubToken) {
    console.error('GITHUB_TOKEN environment variable not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' }),
    };
  }

  try {
    // Parse request body
    const payload: FeedbackPayload = JSON.parse(event.body || '{}');

    // Validate required fields
    if (!payload.title || !payload.description) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Title and description are required' }),
      };
    }

    // Build issue body
    let issueBody = `## Feedback\n\n${payload.description}\n\n`;

    if (payload.category) {
      issueBody += `**Category:** ${payload.category}\n\n`;
    }

    if (payload.url) {
      issueBody += `**Page URL:** ${payload.url}\n\n`;
    }

    if (payload.userEmail) {
      issueBody += `**Contact:** ${payload.userEmail}\n\n`;
    }

    issueBody += `---\n*This issue was automatically created from user feedback.*`;

    // Create GitHub issue
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `[Feedback] ${payload.title}`,
        body: issueBody,
        labels: ['feedback', payload.category.toLowerCase()],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('GitHub API error:', errorData);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to create GitHub issue' }),
      };
    }

    const issue = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        issueUrl: issue.html_url,
        issueNumber: issue.number,
      }),
    };
  } catch (error) {
    console.error('Error creating feedback issue:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

export { handler };
