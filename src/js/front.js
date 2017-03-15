var sort = 'all';
getSearch();

function getSearch(){
    $('.output').remove();
    let j = 0;
    $.getJSON('/monitoring/' + sort, function(data){
        
        for(let i in data){

            let tableContent = '';
            
            tableContent += '<tr class="output">';
            tableContent += '<th scope="row">' + i;
            tableContent += '<td>'+data[i].kf+'</td>';
            tableContent += '<td>'+data[i].ftn+'</td>';
            tableContent += '<td>'+data[i].stn+'</td></th></tr>';

            $('#sTable').append(tableContent);
            j++;
        }
    }).done(function(){

    });
    
}

function toSort(){
    if (sort == '-1')
        sort = '1';
    else
        sort = '-1';
    getSearch();
}