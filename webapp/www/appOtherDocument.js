/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 * fonction permettant d'afficher les informations stocké d'un contact.
 * @item un thirdpaty dans lequel on va regarder son TContact
 * @args arguments
 */
function showContact(item, args)
{
    var container = $('#contact-card');
    if (typeof args != 'undefined' && typeof args.container !='undefined') {
        container = args.container;
    }
    
    var find = false;
    for(x in item.TContact) {
        contact = item.TContact[x];
        
        if(contact.id == args.fk_contact) {
            setItemInHTML(container, contact);
            $("#fk_thirdparthy_contact_card").val(item.id);
            find = true;
            break;
        }
    }
        
    if(!find) {
        
        showMessage('Erreur','Impossible de voir le contact','warning');
        
    }
}

/*
 * affiche une commande /! Non implementé !/
 */
function showOrder(item)
{
    setItemInHTML($('#order-card'), item);
}

/*
 * affiche une facture /! Non implementé !/
 */
function showBill(item)
{
    setItemInHTML($('#bill-card'), item);
}



function refreshAssociateProposalList($container, TPropal)
{
	var x = 0; 
	$container.empty();
        if(!TPropal){
            $("#title-proposals").addClass("hidden");
            console.log("UNDEFINEEED");
        }
        else {
            $("#title-proposals").removeClass("hidden");
            console.log("OR NO");
        }
	for (var i in TPropal)
	{

                var $li = $('<li class="list-group-item"><a data-toggle="tab" href="#proposal-card" onclick="javascript:showItem(\'proposal\', '+TPropal[i].id+', showProposal)">'+TPropal[i].ref+'<br>'+TPropal[i].statut_libelle+'</a></li>');
		$container.append($li);
		
		
	}
}
/*
 * affiche la liste des commande /! Non implementé !/
 */
function refreshAssociateOrderList($container, TOrder)
{
    var x = 0;
    $container.empty();
    for (var i in TOrder)
    {
        var $li = $('<li><a data-toggle="tab" href="#order-card" onclick="javascript:showItem(\'order\', ' + TOrder[i].id + ', showOrder)">' + TOrder[i].ref + '</a></li>');
        $container.append($li);

        if (x > 10)
            return;
        else
            x++;
    }
}

/*
 * affiche la liste des facture /! Non implementé !/
 */
function refreshAssociateBillList($container, TBill)
{
    var x = 0;
    $container.empty();
    for (var i in TBill)
    {
        var $li = $('<li><a data-toggle="tab" href="#bill-card" onclick="javascript:showItem(\'bill\', ' + TBill[i].id + ', showBill)">' + TBill[i].ref + '</a></li>');
        $container.append($li);

        if (x > 10)
            return;
        else
            x++;
    }
}

/*
 * affiche la liste des contact d'un thirdparty
 * @argument {jquery} $container | l'endroit on sera affiché la liste des contacts
 * @argument {json} item | un thirdparty 
 */
function refreshAssociateContactList($container, item)
{
    
    TContact = item.TContact;
    
    var x = 0;
    $container.empty();
    for (var i in TContact)
    {
        if(TContact[i].deleted_by_indexedDB != 1) {
            var $li = $('<li class="list-group-item"><a data-toggle="tab" href="#contact-card" onclick="javascript:showItem(\'contact\', ' + TContact[i].id + ', showContact , {fk_thirdparty : '+item.id+', fk_contact:'+ TContact[i].id +'})">' + TContact[i].firstname + '     ' + TContact[i].lastname + '<br>'+TContact[i].address+', '+TContact[i].town+'<br>'+TContact[i].phone_pro+'</a></li>');
            $container.append($li);
            if (x > 10)
            return;
            else
            x++;
        }
        

        
    }
}
