document.getElementById('player-data').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('slno', document.getElementById('slno').value);
    formData.append('name', document.getElementById('name').value);
    formData.append('year', document.getElementById('year').value);
    formData.append('role', document.getElementById('role').value);
    formData.append('photo', document.getElementById('photo').files[0]); // Append the image file

    try {
        const response = await fetch('/data', {
            method: 'POST',
            body: formData, // Send the formData object
        });
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error submitting player data:', error);
    }
});
