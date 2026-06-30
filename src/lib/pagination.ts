export const NOTIFICATIONS_PAGE_SIZE = 10;
export const CONVERSATIONS_PAGE_SIZE = 10;
// Cap how many messages a thread loads at once so very long conversations
// don't pull their entire history on every open.
export const MESSAGES_PAGE_SIZE = 100;
