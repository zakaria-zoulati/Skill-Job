let expressions = ["With more than 500 000 partner!!","Are you looking for a job?","Are you looking for The best opportunity?","What Do you Wait!!","My-Job"] ;
let exp = document.getElementById("Overview") ;
let a=0 ;
setInterval(()=>{exp.textContent=expressions[a%5];a++},5000) ;


let btn_key = document.getElementById("btn_keyword");
let keyword = document.getElementById("keywords");
let search = document.getElementById("search");
let keywords = [];
let displayed_ids=[] ;
btn_key.addEventListener('click', async () => {
    let a = keyword.value.trim();
    keyword.value = '';
    if (!a) {
        return;
    }

    if (keywords.includes(a)) {
        // Do something if the keyword is already in the array
    } else {
        keywords.push(a);

        // Create a div to display the keyword
        let div = document.createElement('div');
        div.textContent = a;
        div.classList.add('kkeys');
        search.after(div);

        // Fetch data from the database
        try {
            const response = await fetch(`/jobs?keyword=${encodeURIComponent(a)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const jobs = await response.json();

            // Display job opportunities in divs
            for (const job of jobs) {
                try {
                    const companyResponse = await fetch(`/company_name_email?number=${encodeURIComponent(job.id_company)}`);
                    if (!companyResponse.ok) {
                        throw new Error(`HTTP error! Status: ${companyResponse.status}`);
                    }

                    const company_email = await companyResponse.json();

                    // let jobDiv = document.createElement('div');
                    // jobDiv.textContent = `Job Description: ${job.job_description}, Skills: ${JSON.stringify(job.skills)}, Name: ${company_email.name}`;
                    // jobDiv.classList.add('job-opportunity');
                    // document.body.after(jobDiv);

if(!displayed_ids.includes(job.id)){
    displayed_ids.push(job.id) ;

                    let table =document.getElementById('tbody') ;

                    let description = document.createElement('tr') ;
                    let inner_des = document.createElement('th') ;
                    inner_des.textContent=job.job_description ;
                    inner_des.setAttribute('colspan','3') ;
                    inner_des.classList.add('divider') ;
                    description.append(inner_des) ;
                    table.append(description) ;

                    let s_row = document.createElement('tr') ;
                    let s_name = document.createElement('td') ;
                    let s_location = document.createElement('td') ;
                    let  s_gmail= document.createElement('td') ;
                    s_name.textContent=company_email.name ;
                    s_gmail.textContent=company_email.email ;
                    s_location.textContent=job.location;
                    s_row.append(s_name) ;
                    s_row.append(s_location) ;
                    s_row.append(s_gmail) ;
                    s_row.style.fontWeight='bold' ;
                    table.append(s_row) ;

                    let third_row = document.createElement('tr') ;
                    let col_1 = document.createElement('td') ;
                    let col_2 = document.createElement('td') ;
                    col_1.textContent='Skills needed' ;
                    col_2.textContent='Years of experience' ;
                    col_1.setAttribute('colspan','2') ;
                    col_1.classList.add('divider') ;
                    col_2.classList.add('divider') ;
                    col_1.style.fontWeight='bold';
                    col_2.style.fontWeight='bold';
                    third_row.append(col_1) ;
                    third_row.append(col_2) ;
                    table.append(third_row) ;

                    for (let key in job.skills) {
                        let row_skill = document.createElement('tr');
                        let skill = document.createElement('td');
                        let years = document.createElement('td');
                        
                        skill.setAttribute('colspan', '2');
                        skill.textContent = key;
                        years.textContent = job.skills[key]; // Access the value using key
                        
                        row_skill.append(skill);
                        row_skill.append(years);
                        table.append(row_skill);
                    }
                    
                    let other_sep = document.createElement('tr');
                    let inner_sep = document.createElement('th') ;
                    inner_sep.setAttribute('colspan','3') ;
                    inner_sep.style.backgroundColor='red' ;
                    inner_sep.style.height='10px' ;
                    other_sep.append(inner_sep) ;
                    table.append(other_sep) ;
                }


                } catch (companyError) {
                    console.error('Error fetching company name:', companyError);
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }
});

// let btn_c_delete  = document.getElementsByClassName("delete") ;

// for(let c_btn of btn_c_delete){
//     c_btn.addEventListener('click' ,()=>{
//         alert("This element is well deleted") ;
//     })
// }




