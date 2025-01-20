export function formatDate(dateString: string): string {
    const date: Date = new Date(dateString);
    const day: string = date.getDate().toString().padStart(2, '0');
    const month: string = (date.getMonth() + 1).toString().padStart(2, '0');

    const hours: string = date.getHours().toString().padStart(2, '0');
    const minutes: string = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month} ${hours}:${minutes}`;
}
