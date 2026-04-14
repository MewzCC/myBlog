export type Route =
  | { name: 'home' }
  | { name: 'article'; params: { id: string } }
  | { name: 'category'; params: { id: string; name: string } }
  | { name: 'tag'; params: { id: string; name: string } }
  | { name: 'search'; params: { query: string } }
  | { name: 'archive' }
  | { name: 'guestbook' }
  | { name: 'about' }
  | { name: 'editor' }
  | { name: 'auth' }
  | { name: 'user' }
  | { name: 'admin' }
  | { name: '404' }
