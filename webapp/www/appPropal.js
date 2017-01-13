/* 
 * appPropal.js contain all function has been in app.js which refer to Propal
 */

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