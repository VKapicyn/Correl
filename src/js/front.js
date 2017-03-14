getSearch();

function getSearch(){
    $('.output').remove();
    console.log('zashel')
    let j = 0;
    $.getJSON('/monitoring', function(data){
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