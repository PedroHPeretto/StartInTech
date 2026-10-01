import { http, HttpResponse } from 'msw';

export const mswHandlers = [
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' });
  }),
];
