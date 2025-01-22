interface IEnvironment {
  production: boolean;
  baseApiUrl: string;
}

export const environment: IEnvironment = {
  production: false,
  baseApiUrl: 'http://localhost:5001/api/',
};
