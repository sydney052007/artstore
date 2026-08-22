import flatpickr from "flatpickr";
import './css/index_style.css'

document.addEventListener('DOMContentLoaded', function() {
    console.log("trigger");
    document.querySelectorAll('.rent_date').forEach(input => {
        let disabledRanges = [];
        if(input.dataset.rent_date != []){
            let rentDates = JSON.parse(input.dataset.rent_date);
            if (typeof rentDates === "string") {
                rentDates = JSON.parse(rentDates);
            }
            console.log(rentDates, typeof rentDates);
            disabledRanges = rentDates.map(date => {
                let startDate = new Date(date);
                let endDate = new Date(date);
                endDate.setDate(endDate.getDate() +30);
                console.log(startDate, endDate)
                const endDateStr = endDate.toISOString().split("T")[0];
    
                return { from: date, to: endDateStr};
            })
        }

        
        console.log(disabledRanges);
        const selector = `#rent_date${input.dataset.id}`;
        console.log(selector)
        flatpickr(selector, {
            dateFormat: "Y-m-d", 
            minDate: "today",    
            enableTime: false,
            disable: disabledRanges,
            allowInput: true,
            onChange: function(selectedDates, dateStr, instance) {
                if (!dateStr) {
                    instance.input.setCustomValidity("請選擇開始日期！");
                } else {
                    instance.input.setCustomValidity("");
                }
                instance.input.reportValidity();
            }
        }) 
    })

    if (document.querySelector(".avatar")) {
        console.log("avatar");
        document.getElementById("avatar").addEventListener("change", function() {
            let fileName = this.files[0] ? this.files[0].name : "No file selected";
            document.getElementById("file-name").textContent = fileName;
        });
    }
});




document.body.addEventListener("htmx:configRequest", function(event) {
    event.detail.headers["X-Force-Http"] = "true";
});
