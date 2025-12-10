export type SignInRequest = {
  email: string;
  password: string;
};

export type SignInResponse = {
  access_token: string;
  token_type: 'Bearer';
  expire_in: number;
  refresh_token: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};
