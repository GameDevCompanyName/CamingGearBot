import { CampingList } from '../types';

/**
 * Экранирует специальные символы для Markdown
 */
export function escapeMarkdown(text: string): string {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Форматирует сообщение с информацией о походе
 */
export function formatListMessage(list: CampingList): string {
    const tempEmoji = {
        cold: '❄️',
        cool: '🌡️',
        warm: '☀️',
        hot: '🔥'
    };

    const conditions = [];
    if (list.conditions.rain) conditions.push('☔ Дождь');
    if (list.conditions.swimming) conditions.push('🏊‍♂️ Купание');
    if (list.conditions.minimizeWeight) conditions.push('⚖️ Минимизация веса');
    conditions.push(`${tempEmoji[list.conditions.temperature]} Температура: ${list.conditions.temperature}`);

    return `*${escapeMarkdown(list.name)}*

👥 Количество людей: ${escapeMarkdown(String(list.people))}
📅 Дней: ${escapeMarkdown(String(list.days))}

🌦️ *Условия:*
${conditions.join('\n')}

🍳 Блюда: ${escapeMarkdown(String(list.meals.length))}`;
}
