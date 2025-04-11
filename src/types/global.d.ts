export {};

declare global {
  interface UserPrivateMetadata {
    githubInstallationIds: number[] | undefined;
  }
}
