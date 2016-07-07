<?php
  $to      = 'katerina.kholyavkina@gmail.com';
  $subject = 'Сообщение из контактной формы сайта-портфолио';
  $headers = 'From: katerina.kholyavkina@gmail.com' . "\r\n" .
      'Reply-To: katerina.kholyavkina@gmail.com' . "\r\n" .
      'X-Mailer: PHP/' . phpversion();

  $name = trim($_POST["contactname"]);
  $email = trim($_POST["contactemail"]);
  $text = trim($_POST["contactmessage"]);

  // print_r($_POST);

  $message = "Имя: $name\r\nИмейл: $email\r\nСообщение: $text";

  $result = mail($to, $subject, $message, $headers);

  if($result) {
    echo 'Спасибо! Ваше сообщение успешно отправлено';
  }
  else {
    echo 'Сообщение не отправлено! Попробуйте снова';
  }

?>