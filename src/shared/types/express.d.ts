// Augments Express's Request with the authenticated user object that the
// `authenticate` middleware (added in a later commit) attaches.
// Keeping this declaration in one place means every handler gets a
// properly-typed `req.user` without `any`-casts at the auth boundary.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

export {};
