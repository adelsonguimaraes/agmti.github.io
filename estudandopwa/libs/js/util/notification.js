if ('Notification' in window) {
//   $status.innerText = Notification.permission;
    console.warn(Notification.permission);
//   return false;
}

function requestPermission() {
  if (!('Notification' in window)) {
    console.error('Notification API not supported!');
    return;
  }
  
  Notification.requestPermission(function (result) {
    // $status.innerText = result;
    console.warn(result);
  });
}
requestPermission();

// notification sem ServiceWorker, não funciona mobile
function nonPersistentNotification() {
  if (!('Notification' in window)) {
    console.warn('Notification API not supported!');
    return;
  }
  
  try {
    var options = {
        body: "Katros está online.",
        icon: 'http://pm1.narvii.com/6496/9f8fa6eb74db07eef91e502c0910d9e766fc41ac_128.jpg'
    };
    var notification = new Notification("Um amigo logou", options);
  } catch (err) {
    console.warn('Notification API error: ' + err);
  }
}

// notifcation com Service Worker, funciona Mobile e Desktop
function persistentNotification() {
  if (!('Notification' in window) || !('ServiceWorkerRegistration' in window)) {
    console.warn('Persistent Notification API not supported!');
    return;
  }
  
    try {
        var options = {
            body: "Local Notification Testando.",
          icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfX7S-kEZdDmczOqUo9YkG2mDOrc1KFcWUSBJ5gQQY5B0aHmyHgA'
        };
        navigator.serviceWorker.getRegistration()
        .then(reg => reg.showNotification("Um amigo logou", options))
        .catch(err => console.warn('Service Worker registration error: ' + err));
    } catch (err) {
        console.warn('Notification API error: ' + err);
    }
}



function escutaAgenda () {
  setTimeout(function () {
      persistentNotification();
      console.log('Chamando a local notificantion');
  }, 10000);
}

escutaAgenda();