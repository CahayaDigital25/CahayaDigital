<?php
// Handle login attempts
$error = '';
$success = false;
$redirectDelay = 1; // 1 second delay per requirements

// Correct credentials
$correct_username = "Onomah1337*$";
$correct_password = "Onomah1337*$";

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    
    // Validate credentials
    if ($username === $correct_username && $password === $correct_password) {
        $success = true;
        // Set cookies or session here if needed
        session_start();
        $_SESSION['admin_logged_in'] = true;
        $_SESSION['admin_username'] = $username;
        
        // Will redirect after delay
    } else {
        $error = "Username atau password salah. Silakan coba lagi.";
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login - CahayaDigital25</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .login-container {
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            text-align: center;
        }
        .logo {
            margin-bottom: 2rem;
            font-size: 24px;
            font-weight: bold;
        }
        .logo span:first-child, .logo span:last-child {
            color: #e53e3e;
        }
        .logo span:nth-child(2) {
            color: #4a5568;
        }
        h1 {
            color: #333;
            margin-bottom: 1.5rem;
            font-size: 1.5rem;
        }
        .form-group {
            margin-bottom: 1rem;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 0.5rem;
            color: #4a5568;
            font-weight: bold;
        }
        input[type="text"], input[type="password"] {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1rem;
            box-sizing: border-box;
        }
        button {
            background-color: #e53e3e;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 0.75rem 1.5rem;
            font-size: 1rem;
            cursor: pointer;
            width: 100%;
            margin-top: 1rem;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        button:hover {
            background-color: #c53030;
        }
        .error-message {
            color: #e53e3e;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
        .success-message {
            color: #38a169;
            margin-top: 1rem;
            font-size: 0.9rem;
        }
        .back-link {
            margin-top: 1.5rem;
            display: inline-block;
            color: #4a5568;
            text-decoration: none;
            font-size: 0.9rem;
        }
        .back-link:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo">
            <span>Cahaya</span><span>Digital</span><span>25</span>
        </div>
        <h1>Login Admin Panel</h1>
        
        <?php if ($success): ?>
            <div class="success-message">
                Login berhasil! Anda akan dialihkan dalam <?php echo $redirectDelay; ?> detik...
            </div>
            <script>
                // Delay redirect as specified
                setTimeout(function() {
                    window.location.href = '/';
                }, <?php echo $redirectDelay * 1000; ?>);
            </script>
        <?php else: ?>
            <?php if ($error): ?>
                <div class="error-message"><?php echo $error; ?></div>
            <?php endif; ?>
            
            <form method="post" action="">
                <div class="form-group">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required autocomplete="off">
                </div>
                
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit">Login</button>
            </form>
        <?php endif; ?>
        
        <a href="/" class="back-link">← Kembali ke Beranda</a>
    </div>
</body>
</html>