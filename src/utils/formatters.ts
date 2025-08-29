/**
 * Escapes special characters for Telegram MarkdownV2 format
 * @param text Text to escape
 * @returns Escaped text safe for MarkdownV2
 */
export function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Formats a message with bold text for Telegram MarkdownV2
 * @param text Text to format
 * @returns Formatted text with escaped characters
 */
export function formatBold(text: string): string {
    const escaped = escapeMarkdown(text);
    return `*${escaped}*`;
}

/**
 * Formats a list item with emoji for Telegram MarkdownV2
 * @param emoji Emoji to use
 * @param text Text to format
 * @param value Optional value to append
 * @returns Formatted list item
 */
export function formatListItem(emoji: string, text: string, value?: string): string {
    const escapedText = escapeMarkdown(text);
    const escapedValue = value ? escapeMarkdown(value) : '';
    return `${emoji} ${escapedText}${escapedValue ? ': ' + escapedValue : ''}`;
}
