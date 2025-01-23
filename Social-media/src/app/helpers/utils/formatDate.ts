/**
 * Formats a date string into a custom format (DD.MM HH:MM).
 * @param dateString - The input date as a string.
 * @returns The formatted date string in the format "DD.MM HH:MM".
 */
export function formatDate(dateString: string): string {
    const date: Date = new Date(dateString);
    const day: string = date.getDate().toString().padStart(2, '0');
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');

    const hours: string = date.getHours().toString().padStart(2, '0');
    const minutes: string = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month} ${hours}:${minutes}`;
}
