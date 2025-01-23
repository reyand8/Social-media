interface IEnvironment {
  production: boolean;
  baseApiUrl: string;
  baseSocketUrl: string;
}

export const environment: IEnvironment = {
  production: false,
  baseApiUrl: 'http://localhost:5001/api/',
  baseSocketUrl: 'http://localhost:3001',
};
