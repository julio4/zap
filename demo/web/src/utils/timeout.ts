async function timeout(seconds: number): Promise<void> {
  // todo: put in utils
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

export default timeout;
