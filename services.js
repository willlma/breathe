const { runtime } = chrome;

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    const promise = runtime.sendMessage(message, (response) => {
      resolve(response);
    });

    if (promise) resolve(promise);
  });
}
