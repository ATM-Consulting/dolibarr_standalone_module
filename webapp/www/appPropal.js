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
        $('li.active').removeClass('active').addClass('visible');

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
        //console.log(args);
        container = args.container;
    
    refreshProposalLines($('#proposal-card .lines_propal'), item.lines);
    getNomClient($('#proposal-card #nomDuClient'), item.socid);
    setItemInHTML(container, item);
    $("#total_ttc").html(parseFloat($("#total_ttc").html()).toFixed(2));
    $("#total_ht").html(parseFloat($("#total_ht").html()).toFixed(2));
    $("#total_tva").html(parseFloat($("#total_tva").html()).toFixed(2));
    $('li.active').removeClass('active').addClass('visible');
    
    $('a#last-proposal').html(item.ref).closest('li').removeClass('hidden').addClass('active');


    if(item.statut > 1){
        $(".btn-edit").hide();
    } else {
        $(".btn-edit").show();
    }
    if(item.statut==0){
        $(".btn-validate").show();
    } else {
        $(".btn-validate").hide();
    }
}
function getNomClient($container, socid){
    doliDb.setNomClient('thirdparty',socid,['id_dolibarr'],$container);
    
}

function refreshProposalLines($container, TPropal)
{
    var x = 0;
    var temp;
    $container.empty();
    for (var i in TPropal)
    {
        temp=null;
        if(x==0){
            var temp=$('<thead><tr><th>Nom</th><th>Prix</th><th>Quantite</th><th>TVA (%)</th><th>Remise (%)</th></tr></thead>'); 
            x++;
        }
        console.log("TPropal");
        console.log(TPropal);
        if(TPropal[i].libelle !=null){
            ref = TPropal[i].libelle;
        } else if(TPropal[i].ref != null){
            ref = TPropal[i].ref;
        } else{
            ref = TPropal[i].desc;
        }
        if(TPropal[i].subprice == null){
            TPropal[i].subprice = 0;
        }
        var $li = $('<tr><td name="libelle">' + ref + '</td><td name="price">' + parseFloat(TPropal[i].subprice).toFixed(2) + '</td><td name="qty">' + TPropal[i].qty + '</td><td name="tva_tx">' +parseFloat( TPropal[i].tva_tx ).toFixed(2) + '</td><td name="remise">' + parseFloat(TPropal[i].remise_percent).toFixed(2) + '</td></tr>');
        if(temp!=null){
            $container.append(temp);
        }
        $container.append($li);
        
        
    }
    //$("#total_ttc").innerHTML = parseFloat($("#total_ttc").innerHTML).toFixed(2);
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

/*
 * Fonction permettant de charger les informations d'une propal en parcourant ses champs et 
 * en cherchant le champ avec le même attribut "name" sur la page html (propal-card-edit)
 * @argument {json} item | une propal
 */
function editProposal(item) {
    var $container = $('#proposal-card-edit');
    $container.children('input[name=id]').val(item.id_dolibarr);
    propalProductList=[];
    $("#tableListeProduitsBodyEdit").empty();
    $("#totaltableEdit").val("");
   $('#proposal-card-edit #nom_client').children('input[name=nom-client]').val($('#proposal-card h1[rel=nom-client]').children('p').html());

    for (var x in item) {
        if(x){
        $container.find('[name=' + x + ']').val(item[x]);
        if(x=='lines'){
          for(nb=0;nb<item.lines.length;nb++){
              var line = item.lines[nb];
             if(line.libelle !=null){
                 ref=line.libelle;
             }else if(line.ref !=null){
                 ref=line.ref;
             }else {
                 ref=line.desc;
             }
             if(line.subprice == null){
                 line.subprice=0;
             }
             
              propalProductList.push({
                  'libelle':ref
                  ,'prix':parseFloat(line.subprice).toFixed(2)
                  ,'quantite':line.qty
                  ,'remise_percent':line.remise_percent
                  ,'tva_tx':parseFloat(line.tva_tx).toFixed(2)
                  
              });
          }
      }
      if(item[x]=='Due Upon Receipt'){
        $container.find('[name=' + x + ']').val("A la reception");
        console.log('HAHAHALOLOLO');
      }
    }}
    
    if(propalProductList.length != 0){majTableau("edit");}
}

/*
 * mise à jour du tableau pour qu'il affiche le contenu de propalProductList
 * @argument {string} bodyWillUpdated | juste un champ text permettant le différentiation entre la page proposal-card-edit
 * et proposal-card-add
 */
function majTableau(bodyWillUpdated){
    if(bodyWillUpdated=="add"){
        bodyUpdated=$('#tableListeProduitsBodyAdd')
        
    }
    else{
        bodyUpdated=$('#tableListeProduitsBodyEdit')
    }
    bodyUpdated.empty();
    propalProductList.forEach(function(element){
       
        bodyUpdated.append('<tr name="line">'+
        '<td name=libelle>'+element.libelle+'</td>'+
        '<td id=pUprod name=price>'+element.prix+'</td>'+
        '<td id=nbprod name=qty><input class="inputQu" type="number" min="1" size="5" value="'+element.quantite+'" onChange=majQuantity("'+bodyWillUpdated+'")></td>'+
        '<td id=tva_tx name=tva_tx>'+element.tva_tx+'</td>'+
        '<td id=remise_percent name=remise_percent><input class="inputRemise" type="number" min="1" max="100" size="4" value="'+element.remise_percent+'" onChange=majRemise("'+bodyWillUpdated+'")></td>'+
        '<td><span class="glyphicon glyphicon-remove" onClick="removePropalLines($(this));"></span></td>'+
    '</tr>');
    });
    updatetotal(bodyWillUpdated);
}

/*
 * mise a jour de la quantite du produit dans propalProductList
 * appele sur un onchange du champs quantite input
 * @argument {string} bodyWillUpdated | juste un champ text permettant le différentiation entre la page proposal-card-edit
 * et proposal-card-add
 */
function majQuantity(bodyWillUpdated){
    if(bodyWillUpdated=="add"){
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
    updatetotal(bodyWillUpdated);
}
function majRemise(bodyWillUpdated){
    if(bodyWillUpdated=="add"){
        remise_percent=$("#tableListeProduitsBodyAdd").find("input[class=inputRemise]");
        remise_percent.each(function(i,e){
            propalProductList[i].remise_percent=e.value;
        });
    }
    else{
        remise_percent=$("#tableListeProduitsBodyEdit").find("input[class=inputRemise]");
        remise_percent.each(function(i,e){
            propalProductList[i].remise_percent=e.value;
        });
    }
    updatetotal(bodyWillUpdated);
}

/*
 * mise a jour du total du coup de la propal dans le champ input. 
 * peut être une refactorisation pour parcourir propalProductList et non l'html
 * @argument {string} bodyWillUpdated | juste un champ text permettant le différentiation entre la page proposal-card-edit
 * et proposal-card-add
 */
function updatetotal(bodyWillUpdated){

    var total=0;
    var totalht=0;
    console.log("updatetotal");
    if(bodyWillUpdated=="add"){
        $('#tableListeProduitsBodyAdd > tr ').each(function(){ //parcours tout les element 'tr' de #tableListeProduitsBody puis trouve les quantité et les pU pour calculer le total
            pU = $(this).children('td[id="pUprod"]').text();
            quantite = $(this).find('input').val();
            tva = $(this).find('td[id="tva_tx"]').text();
            reduction = $(this).find('input[class="inputRemise"]').val();
            pht = (pU*quantite);
            console.log("pht");
            console.log(pht);
            if(reduction != "0" || reduction !=""){
                
                pht=pht-(pht*(reduction/100));
                console.log("phtReduit");
                console.log(pht);
            }
            if(tva != "0"){
                 
                 ptot = pht+pht*(tva/100);
                 total= parseFloat(total)+ parseFloat(ptot);
            }else {
                total=parseFloat(total) + parseFloat(pht);
            }
            console.log("total");
            console.log(total);
            
                
            
            
        });
         tva = parseFloat(total-ptot).toFixed(2);
         total =parseFloat(total).toFixed(2);
         ptot =parseFloat(ptot).toFixed(2);
         
        $('#totaltableTTCAdd').val(total);
        $('#totaltableHTAdd').val(ptot);
        $('#totaltableTVAAdd').val(tva);
    }
    else{
        $('#tableListeProduitsBodyEdit > tr ').each(function(){ //parcours tout les element 'tr' de #tableListeProduitsBody puis trouve les quantité et les pU pour calculer le total
            pU = $(this).children('td[id="pUprod"]').text();
            quantite = $(this).find('input').val();
            tva = $(this).find('td[id="tva_tx"]').text();
            reduction = $(this).find('input[class="inputRemise"]').val();
            pht = (pU*quantite);
            console.log("pht");
            console.log(pht);
            if(reduction != "0" || reduction !=""){
                
                pht=pht-(pht*(reduction/100));
                console.log("phtReduit");
                console.log(pht);
                
            }
            if(tva != "0"){
                 
                 ptot = pht+pht*(tva/100);
                 total= parseFloat(total)+ parseFloat(ptot);
            }else {
                total=parseFloat(total) + parseFloat(pht);
            }
            totalht = totalht+pht;
            console.log("total");
            console.log(total);
            
                
            
            
        });
        tva = parseFloat(total-totalht).toFixed(2);
        total =parseFloat(total).toFixed(2);
        totalht =parseFloat(totalht).toFixed(2);
         
        $('#totaltableTTCEdit').val(total);
        $('#totaltableHTEdit').val(totalht);
        $('#totaltableTVAEdit').val(tva);
    }
}

/*
 * ajout d'un produit inconnu de la base de donnee à la propal 
 * à partir des informations rentré dans les champ input stockée dans le "tfoot"
 * l'ajoute à propalProductList
 * @argument {string} bodyWillUpdated | juste un champ text permettant le différentiation entre la page proposal-card-edit
 * et proposal-card-add
 */
function addUnExistProduct(bodyWillUpdated){
    if(bodyWillUpdated=="add"){
        name=$('#unexistProductAdd').find('input[id="name"]').val();
        prix=$('#unexistProductAdd').find('input[id="pUprod"]').val();
        quantite=$('#unexistProductAdd').find('input[id="nbprod"]').val();
        tva=$('#unexistProductAdd').find('select[name="tva_tx"]').val();
        remise=$('#unexistProductAdd').find('input[id="remise_percent"]').val();
        if (name!="" && prix!="" && quantite!="" ){
            propalProductList.push({'id_dolibarr':"",'libelle':name,'prix':prix,'quantite':quantite,'tva_tx':tva,'remise_percent':remise, 'fk_product':0});
            $('#unexistProductAdd').find('input[id="name"]').val("");
            $('#unexistProductAdd').find('input[id="pUprod"]').val("");
            $('#unexistProductAdd').find('input[id="nbprod"]').val("");
            $('#unexistProductAdd').find('select[name="tva_tx"]').val(0);
            $('#unexistProductAdd').find('input[id="remise_percent"]').val("");
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
        tva=$('#unexistProductEdit').find('select[name="tva_tx"]').val();
        remise=$('#unexistProductEdit').find('input[id="remise_percent"]').val();
        if (name!="" && prix!="" && quantite!="" ){
            propalProductList.push({'id_dolibarr':"",'libelle':name,'prix':prix,'quantite':quantite,'tva_tx':tva,'remise_percent':remise, 'fk_product':0});
            $('#unexistProductEdit').find('input[id="name"]').val("");
            $('#unexistProductEdit').find('input[id="pUprod"]').val("");
            $('#unexistProductEdit').find('input[id="nbprod"]').val("");
            $('#unexistProductEdit').find('select[name="tva_tx"]').val(0);
            $('#unexistProductEdit').find('input[id="remise_percent"]').val("");
            majTableau("edit");
        }
        else{
            alert("Some field are empty !");
        }
    }
}

/*
 * supprime une ligne du tableau propalProductList puis remet à jour l'affichage html
 * @argument {jquery} elemDom | le bouton "X" sur lequel on a clique (appartenant à la ligne que l'on veut supprimer)
 */
function removePropalLines(elemDom){
    console.log("elemDom");
    console.log(elemDom);
    nbline = elemDom.parent().parent()[0].rowIndex-1
    for(nbline;nbline<propalProductList.length;nbline++){
        propalProductList[nbline]=propalProductList[nbline+1];
    }
    propalProductList.pop();
    console.log(propalProductList);
    if($("div.active").attr('id') == 'proposal-card-add'){
         majTableau("add");
    }else {
         majTableau("edit");
    }
}

/*
 * vide le tableau propalProductList puis remet à jour l'affichage html
 */
function clearAllPropalLines(){
    propalProductList=[];
    majTableau("edit");
}