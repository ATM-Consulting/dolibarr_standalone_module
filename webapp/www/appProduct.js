/* 
 * appProduct.js contain all function has been in app.js which refer to Products
 */


/*
 * method which create the list of product.
 * The onClick param is differente if this method has been called in proposal o in other.
 */
function refreshProductList(TItem, container, from)
{
    var x = 0;
    ulcontainer = $(container).find('.list_product');
    ulcontainer.empty();
    
    for (var i in TItem)
    {
        switch (from) {
            case 'proposal':
                var $li = $('<li label="' + TItem[i].label + '" class="list-group-item"><a data-toggle="tab" href="#product-card" onclick="javascript:addItem(\'product\', ' + TItem[i].id + ')">' + TItem[i].label + '</a></li>');
                break;
            default:
                if (container == '#product-list-propal') {
                    var $li = $('<li label="' + TItem[i].label + '" class="list-group-item"><a data-toggle="tab" href="#product-card" onclick="javascript:showItem(\'product\', ' + TItem[i].id + ', showProduct)">' + TItem[i].label + '</a><button type="button" class="btn btn-warning btn-circle" onclick="addItemToList(this)"><span class="glyphicon glyphicon-plus"/></button></li>');
                }
                else{
                    var $li = $('<li label="' + TItem[i].label + '" class="list-group-item"><a data-toggle="tab" href="#product-card" onclick="javascript:showItem(\'product\', ' + TItem[i].id + ', showProduct)">' + TItem[i].label + '</a></li>');
                }
                break;
        }

        $(ulcontainer).append($li);
        if (x > 20){
            return;
        }
        else
            x++;
    }
    
    

    addEventListenerOnItemLink();
}
/*
 * call to function setItemInHTML in app.js
 */
function showProduct(item)
{
    setItemInHTML($('#product-card'), item);
} addEventListenerOnItemLink();

/*
 * Fonction permettant de charger les informations d'un produit en parcourant ses champs et 
 * en cherchant le champ avec le même attribut "name" sur la page html (product-card-edit)
 * @argument {json} item | un produit
 */
function editProduct(item)
{
    var $container = $('#product-card-edit');
    $container.children('input[name=id]').val(item.id_dolibarr);

    for (var x in item)
    {
        $container.find('[name=' + x + ']').val(item[x]);
    }
}