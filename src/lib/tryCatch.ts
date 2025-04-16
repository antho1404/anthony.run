export async function tryCatch<T>(
  promise: Promise<T>
): Promise<{ data: null; error: Error } | { data: T; error: null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
