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
    console.log(item);
    propalProductList=[];
    $("#tableListeProduitsBodyEdit").empty();
    $("#totaltableEdit").val("");
    console.log(item);
    for (var x in item) {
        $container.find('[name=' + x + ']').val(item[x]);
        if(x=='lines'){
          for(nb=0;nb<item.lines.length;nb++){
              propalProductList.push({'libelle':item.lines[nb].product_label,'prix':parseFloat(item.lines[nb].subprice).toFixed(2),'quantite':item.lines[nb].qty});
          }
      }
    }
    if(propalProductList.length != 0){majTableau("edit");}
}

function majTableau(bodyWillUpdated){
    if(bodyWillUpdated=="add"){
        bodyUpdated=$('#tableListeProduitsBodyAdd')
    }
    else{
        bodyUpdated=$('#tableListeProduitsBodyEdit')
    }
    majQuantity();
    bodyUpdated.empty();
    propalProductList.forEach(function(element){
        bodyUpdated.append('<tr>'+
        '<td>'+element.libelle+'</td>'+
        '<td id=pUprod>'+element.prix+'</td>'+
        '<td id=nbprod><input class="inputQu" type="number" min="1" size="5" value="'+element.quantite+'" onChange=majQuantity("'+bodyWillUpdated+'")></td>'+
        '<td><span class="glyphicon glyphicon-remove" onClick=test()></span></td>'+
    '</tr>');
    });
    updatetotal();
}

function majQuantity(bodyWillUpdated){
    if(!bodyWillUpdated=="add"){
        quantity=$("#tableListeProduitsBodyAdd").find("input[class=inputQu]");
        quantity.each(function(i,e){
            propalProductList[i].quantite=e.value;
        });
    }
    else{
        quantity=$("#tableListeProduitsBodyEdit").find("input[class=inputQu]");
        quantity.each(function(i,e){
            propalProductList[i].quantite=e.value;
        });
    }
    updatetotal();
}

function updatetotal(bodyWillUpdated){

    var total=0;

    if(!bodyWillUpdated=="add"){
        $('#tableListeProduitsBodyAdd > tr ').each(function(){ //parcours tout les element 'tr' de #tableListeProduitsBody puis trouve les quantité et les pU pour calculer le total
            pU = parseInt($(this).children('td[id="pUprod"]').text());
            quantite = parseInt($(this).find('input').val());
            total=total+(pU*quantite);
        });

        $('#totaltableAdd').val(total);
    }
    else{
        $('#tableListeProduitsBodyEdit > tr ').each(function(){ //parcours tout les element 'tr' de #tableListeProduitsBody puis trouve les quantité et les pU pour calculer le total
            pU = parseInt($(this).children('td[id="pUprod"]').text());
            quantite = parseInt($(this).find('input').val());
            total=total+(pU*quantite);
    });

        $('#totaltableEdit').val(total); //modifier valeur du total dans le champ input
    }
}

function addUnExistProduct(bodyWillUpdated){
    if(bodyWillUpdated=="add"){
        name=$('#unexistProductAdd').find('input[id="name"]').val();
        prix=$('#unexistProductAdd').find('input[id="pUprod"]').val();
        quantite=$('#unexistProductAdd').find('input[id="nbprod"]').val();
        if (name!="" && prix!="" && quantite!="" ){
            propalProductList.push({'libelle':name,'prix':prix,'quantite':quantite});
            $('#unexistProductAdd').find('input[id="name"]').val("");
            $('#unexistProductAdd').find('input[id="pUprod"]').val("");
            $('#unexistProductAdd').find('input[id="nbprod"]').val("");
            majTableau("add");
        }
        else{
            alert("Some field are empty !");
        }
    }
    else{
        name=$('#unexistProductEdit').find('input[id="name"]').val();
        prix=$('#unexistProductEdit').find('input[id="pUprod"]').val();
        quantite=$('#unexistProductEdit').find('input[id="nbprod"]').val();
        if (name!="" && prix!="" && quantite!="" ){
            propalProductList.push({'libelle':name,'prix':prix,'quantite':quantite});
            $('#unexistProductEdit').find('input[id="name"]').val("");
            $('#unexistProductEdit').find('input[id="pUprod"]').val("");
            $('#unexistProductEdit').find('input[id="nbprod"]').val("");
            majTableau();
        }
        else{
            alert("Some field are empty !");
        }
    }
}
