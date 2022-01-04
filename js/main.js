// References to DOM Elements
const prevBtn = $("#prev-btn");
const nextBtn = $('#next-btn');
const book = $('#book');

const paper1 = $('#p1');
const paper2 = $('#p2');
const paper3 = $('#p3');

// Business Logic
let currentLocation = 1;
let numOfPapers = 3;
let maxLocation = numOfPapers + 1;



// FLIP Book FUNCTIONS
const openBook = () =>{
    book.css('transform','translateX(50%)');
    prevBtn.css('transform','translateX(-180px)');
    nextBtn.css('transform','translateX(180px');
}

const closeBook = isAtBegining =>{
    if(isAtBegining){
        book.css('transform','translateX(0%)');
    }else{
        book.css('transform','translateX(100%)');
    }
   
    prevBtn.css('transform','translateX(0px)');
    nextBtn.css('transform','translateX(0px');
}

const goNextPage = () =>{
    console.log("Go Next");
    if(currentLocation < maxLocation){
        switch(currentLocation){
            case 1:
                openBook();
                paper1.addClass("flipped");
                paper1.css('z-index',1);
                break;
            case 2:
                paper2.addClass("flipped");    
                paper2.css('z-index',2);
                break;
            case 3:
                paper3.addClass("flipped");
                paper3.css('z-index',3);
                closeBook(false);
                break;   
            default:
                throw new Error("unknown state");     
        }
        currentLocation++;
    }
}

const goPrevPage = () =>{
    console.log("Go Back");
    if(currentLocation > 1){
        switch(currentLocation){
            case 2:
                closeBook(true);
                paper1.removeClass("flipped");
                paper1.css('z-index',3);
                break;
            case 3:
                paper2.removeClass("flipped");
                paper2.css("z-index",2);
                break;
            case 4:
                openBook();
                paper3.removeClass("flipped");
                paper3.css("z-index",1);
                break;
            default:
                throw new Error("unknown state");           
        }
        currentLocation--;
    }
}

// Event Listener
prevBtn.click(goPrevPage);
nextBtn.click(goNextPage);