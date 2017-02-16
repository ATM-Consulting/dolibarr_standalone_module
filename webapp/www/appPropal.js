/* 
 * appPropal.js contain all function has been in app.js which refer to Propal
 */

/*
 * An array which contain a list of product associed with current propal
 * @type Array
 */
var propalProductList=[];

function refreshProposalList(TItem)
{
    var x = 0;
    $('#proposal-list ul').empty();
    for (var i in TItem)
    {
        var $li = $('<li class="list-group-item"><a data-toggle="tab" href="#proposal-card" onclick="javascript:showItem(\'proposal\', ' + TItem[i].id + ', showProposal)">' + TItem[i].ref + '</a></li>');
        $('#proposal-list ul').append($li);

        if (x > 20)
            return;
        else
            x++;
    }

    addEventListenerOnItemLink();
}

/*
 * call to function setItemInHTML in app.js
 */
function showProposal(item, args)
{
    var container = $('#proposal-card');
    if (typeof args != 'undefined' && typeof args.container != 'undefined')
        container = args.container;
    setItemInHTML(container, item);
}

/*
 * function which list the propal associed to the thirParty choosen
 */
function refreshAssociateProposalList($container, TPropal)
{
    var x = 0;
    $container.empty();
    for (var i in TPropal)
    {
        var $li = $('<li><a data-toggle="tab" href="#proposal-card" onclick="javascript:showItem(\'proposal\', ' + TPropal[i].id + ', showProposal)">' + TPropal[i].ref + '</a></li>');
        $container.append($li);

        if (x > 10)
            return;
        else
            x++;
    }
}

function editProposal(item) {
    var $container = $('#proposal-card-edit');
    $container.children('input[name=id]').val(item.id_dolibarr);

    for (var x in item) {
        console.log('item '+ x +'-->',$container.find('[name=' + x + ']'));
        $container.find('[name=' + x + ']').val(item[x]);
    }
}

function majTableau(){
    majQuantity();
    $('#tableListeProduitsBody').empty();
    propalProductList.forEach(function(element){
        $('#tableListeProduitsBody').append('<tr>'+
        '<td>'+element.libelle+'</td>'+
        '<td id=pUprod>'+element.prix+'</td>'+
        '<td id=nbprod><input class="inputQu" type="number" min="1" size="5" value="'+element.quantite+'" onChange=majQuantity()></td>'+
        '<td><span class="glyphicon glyphicon-remove" onClick=test()></span></td>'+
    '</tr>');
    });
    updatetotal();
}

function majQuantity(){
    test=$("#tableListeProduitsBody").find("input[class=inputQu]")
    test.each(function(i,e){
      propalProductList[i].quantite=e.value;
    });
    updatetotal();
}

function updatetotal(){
    
    var total=0;
    
    $('#tableListeProduitsBody > tr ').each(function(){ //parcours tout les element 'tr' de #tableListeProduitsBody puis trouve les quantité et les pU pour calculer le total
        pU = parseInt($(this).children('td[id="pUprod"]').text());
        quantite = parseInt($(this).find('input').val());
        total=total+(pU*quantite);
    });
    
    $('#totaltable').val(total); //modifier valeur du total dans le champ input
}

function addUnExistProduct(){
    name=$('#unexistProduct').find('input[id="name"]').val();
    prix=$('#unexistProduct').find('input[id="pUprod"]').val();
    quantite=$('#unexistProduct').find('input[id="nbprod"]').val();
    if (name!="" && prix!="" && quantite!="" ){
        propalProductList.push({'libelle':name,'prix':prix,'quantite':quantite});
        $('#unexistProduct').find('input[id="name"]').val("");
        $('#unexistProduct').find('input[id="pUprod"]').val("");
        $('#unexistProduct').find('input[id="nbprod"]').val("");
        majTableau();
    }
    else{
        alert("Some field are empty !");
    }
}