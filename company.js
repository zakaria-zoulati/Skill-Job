let btn_c_delete = document.getElementsByClassName('delete');




for (let c_btn of btn_c_delete) {
    c_btn.addEventListener('click', () => {
        let c_id = c_btn.id.substring(2);

        // Send a request to delete the job using a GET request with a query parameter
        fetch(`/delete_job?id=${c_id}`, {
            method: 'GET',
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Job deleted successfully:', data);
            alert('This element is well deleted');
            location.reload();
        })
        .catch(error => {
            console.error('Error deleting job:', error);
        });
    });
}

let btn_img = document.getElementById("btn_img")  ;


btn_img.addEventListener('click', async () => {
    try {
        alert('Please enter your credentials');
        const id = prompt('Enter your id please');
        const password = prompt('Enter your Password please');

        // Send a request to check credentials using GET request and query parameters
        const checkCredentialsResponse = await fetch(`/check_credentials?id=${id}&password=${password}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!checkCredentialsResponse.ok) {
            throw new Error(`HTTP error! Status: ${checkCredentialsResponse.status}`);
        }

        const credentialsData = await checkCredentialsResponse.json();

        if (credentialsData.valid) {
            // Credentials are valid, proceed with job details

            let jobDescription = prompt('Enter job description:');
            let location = prompt('Enter job location:');
            let numSkills = parseInt(prompt('Enter the number of skills:'));
            let skills = {};

            // Prompt for each skill
            for (let i = 0; i < numSkills; i++) {
                let skillName = prompt(`Enter skill ${i + 1} name:`);
                let yearsOfExperience = parseInt(prompt(`Enter years of experience for ${skillName}:`));

                // Add the skill to the object
                skills[skillName] = yearsOfExperience;
            }

            console.log(skills);

            // Send a request to add job using GET request and query parameters
            const addJobResponse = await fetch(`/add_job?id=${id}&jobDescription=${jobDescription}&location=${location}&skills=${encodeURIComponent(JSON.stringify(skills))}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!addJobResponse.ok) {
                throw new Error(`HTTP error! Status: ${addJobResponse.status}`);
            }

            const addJobData = await addJobResponse.json();
            
            console.log('Job added successfully:', addJobData);
            alert('Job added successfully');
            // setTimeout(()=>{window.location.reload()},1500)
            window.location.reload() ;
            
        } else {
            // Credentials are not valid
            alert('Your credentials are not valid');
            
        }
    } catch (error) {
        console.error('Error:', error);
        // Handle errors more gracefully, e.g., show a user-friendly error message
    }
});




