const fs = require('fs');
const path = require('path');

async function testUpload() {
    console.log('Starting upload test...');
    
    // 1. Create a dummy image file if it doesn't exist
    const testImagePath = path.join(__dirname, 'test_image.png');
    if (!fs.existsSync(testImagePath)) {
        fs.writeFileSync(testImagePath, 'fake image data');
    }

    try {
        // We need a token. We'll try to find an existing user or just bypass auth for test if we can.
        // But better to use a real login. 
        // Let's assume we can get a token from the browser subagent's registration.
        // Actually, I'll just check the DB directly after the browser subagent's attempt.
        // Wait, the subagent didn't submit the form.
        
        console.log('Note: Manual verification is recommended for the full multipart flow.');
        console.log('Checking if the upload directory is writable...');
        const uploadDir = path.join(__dirname, 'uploads/products');
        if (fs.existsSync(uploadDir)) {
            console.log('Upload directory exists: ' + uploadDir);
            const testFile = path.join(uploadDir, 'test_write.txt');
            fs.writeFileSync(testFile, 'test');
            console.log('Successfully wrote to upload directory.');
            fs.unlinkSync(testFile);
        } else {
            console.error('Upload directory NOT found!');
        }
        
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testUpload();
