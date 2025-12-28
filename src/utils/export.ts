import { Roster } from '../types';

export function exportToJSON(roster: Roster) {
  const dataStr = JSON.stringify(roster, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${roster.name.replace(/\s+/g, '_')}_roster.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function exportToPDF(roster: Roster) {
  // Navigate to print page which will have print styles
  window.open(`/print/${roster.id}`, '_blank');
}

export function shareRoster(roster: Roster): string {
  // Generate a shareable URL (for future implementation)
  const baseUrl = window.location.origin;
  return `${baseUrl}/builder/${roster.id}`;
}
