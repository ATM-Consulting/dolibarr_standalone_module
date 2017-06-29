<?php
	if (! defined('NOCSRFCHECK'))    define('NOCSRFCHECK','1');
	if (! defined('NOTOKENRENEWAL')) define('NOTOKENRENEWAL','1');
	if (! defined('NOREQUIREMENU'))  define('NOREQUIREMENU','1');
	if (! defined('NOREQUIREHTML'))  define('NOREQUIREHTML','1');
	
	DEFINE('INC_FROM_CRON_SCRIPT', true);
	
	require('../config.php');
	
	dol_include_once('/core/login/functions_dolibarr.php');
	dol_include_once('/contact/class/contact.class.php');
	dol_include_once('/product/class/product.class.php');
	dol_include_once('/comm/propal/class/propal.class.php');
	$lastSynchro =  GETPOST('tms');
// TODO sync event, propal, order, invoice in order to allow view and edit

	$get = GETPOST('get');
	$put = GETPOST('put');

	$login = GETPOST('login', 'alpha');
	$passwd = GETPOST('passwd', 'alpha');
	$entity = GETPOST('entity', 'int');
	
	// Pour des raisons de sécurité il est nécessaire de vérifier la connexion à chaque demande. A modifier côté JS pour envoyer constament le login/mdp
	$is_user = _check($login, $passwd, $entity);
	if ($is_user == 'ko')
	{
		__out($langs->trans('access_denied'));
		exit;
	} 
	else {
		$user->fetch('', $login, '', 1, $entity);
	}

	switch ($get) {
		case 'check':
			__out($is_user);
			
			break;
		
		case 'product':
			$id = GETPOST('id','int');
			
			if($id) __out(_getItem($get, $id));
			else __out(_getListItem($get, ' WHERE tosell = 1'));
			
			break;
			
		case 'thirdparty':
		case 'proposal':
			$id = GETPOST('id','int');
			
			if($id) __out(_getItem($get, $id));
			else __out(_getListItem($get));
			
			break;
                        
                /*case 'contact':
			$id = GETPOST('id','int');
			
			if($id) __out(_getItem($get, $id));
			else __out(_getListItem($get));
			
			break;
		*/	
	}	
	switch ($put) {
						

		case 'product':
			$TProduct = GETPOST('TItem');
			$TProduct = json_decode($TProduct);
			
			$response = _updateDolibarr($user, $TProduct, 'Product');
			__out($response);
			
			break;
			
		case 'thirdparty':
			$TSociete = GETPOST('TItem');
			$TSociete = json_decode($TSociete);
			
			$response = _updateDolibarr($user, $TSociete, 'Societe');
			__out($response);
			
			break;
			
		case 'proposal':
			$TProposal = GETPOST('TItem');
			$TProposal = json_decode($TProposal);
		

			$response = _updateDolibarr($user, $TProposal, 'Propal');
			__out($response);
			break;
                    
                case 'contact':
			$TContact = GETPOST('TItem');
			$TContact = json_decode($TContact);
			
			$response = _updateDolibarr($user, $TContact, 'Contact');
			__out($response);
			break;
	}
	
function _check($login, $passwd, $entity)
{
	$res = check_user_password_dolibarr($login, $passwd, $entity);
	
	if (!empty($res)) return 'ok';
	else return 'ko';
}

function _getItem($type, $id)
{
	global $db;
	if ($type == 'product') $className = 'Product';
	elseif ($type == 'thirdparty') $className = 'Societe';
	elseif ($type == 'proposal') $className = 'Propal';
        elseif ($type == 'contact') $className = 'Contact';
	else exit($type.' => _getItem non géré');
	
	$o=new $className($db);
	$o->fetch($id);
        /*var_dump($o);
        exit("o");
	*/
        if($type=='thirdparty') {
            
            $TContact = $o->contact_array_objects();
            $o->TContact = $TContact;
        }
        
        
	return $o;
}

function _getListItem($type, $filter='')
{
	global $conf;
	
	if ($type == 'product') $table = 'product';
	elseif ($type == 'thirdparty') $table = 'societe';
	elseif ($type == 'proposal') $table = 'propal';
        elseif ($type == 'contact') $table = 'socpeople';
	else exit('*'.$type.'* => _getListItem non géré');
	
	$PDOdb = new TPDOdb;
	$limit = empty($conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT) ? 100 : $conf->global->STANDALONE_SYNC_LIMIT_LAST_ELEMENT;
	
	$sql = 'SELECT rowid  FROM '.MAIN_DB_PREFIX.$table;
	if (!empty($filter)) $sql .= $filter;
	$sql.= ' ORDER BY tms DESC LIMIT '.$limit;
	
	$Tab = $PDOdb->ExecuteAsArray($sql);
	
	$TResult = array();
	foreach ($Tab as $row) 
	{
		$TResult[$row->rowid] = _getItem($type, $row->rowid);
	}
	
	return $TResult;
}

function _updateDolibarr(&$user, &$TObject, $classname)
{
	global $user,$langs,$db,$conf,$lastSynchro;
	$TError = array();
	foreach ($TObject as $objStd)
	{
		$objDolibarr = new $classname($db);
		// TODO Pour un gain de performance ça serait intéressant de ne pas faire de fetch, mais actuellement nécessaire pour éviter un retour d'erreur non géré pour le moment
		
		if($classname == 'Contact'){
			$resFetch = $objDolibarr->fetch($objStd->id);
		}else {
			$resFetch = $objDolibarr->fetch($objStd->id_dolibarr);
		}
		
                // $objDolibarr->array_options = array(); // TODO pas encore géré
		foreach ($objStd as $attr => $value)
		{
			if (is_object($objDolibarr->{$attr})) continue;
			elseif (is_array($objDolibarr->{$attr})) continue;
			else $objDolibarr->{$attr} = $value;
		}
		if(empty($objStd->id_dolibarr)){
			$objDolibarr->id = null;
		}
		
		switch ($classname) {
			case 'Product':
			case 'Societe':
                            if(!empty($objStd->TContact)){
								foreach($objStd->TContact as &$myContact){
									if(empty($myContact->id)){
										
										$myContact->socid = $objStd->id_dolibarr;
										
									}
									
										
									
									
								}
								_updateDolibarr($user, $objStd->TContact, 'Contact');
							}
								$objDolibarr->client = $objDolibarr->Type;
								($objDolibarr->fournisseur=="Yes") ? $objDolibarr->fournisseur=1 :$objDolibarr->fournisseur=0  ; 
								
								
                                $res = $resFetch > 0 ? $objDolibarr->update($objStd->id_dolibarr, $user) : $objDolibarr->create($user);
								if($objStd->deleted_by_indexedDB){
									$objDolibarr->delete($objDolibarr->id,$user);
								}
				break;
			case 'Propal':
				dol_syslog('STANDALONE::interface.php case Propal',LOG_DEBUG);
				$objDolibarr->socid = $objStd->socid;
				$objDolibarr->remise = 0;
				$objDolibarr->datep = time();
				$objDolibarr->author = $user->id;
				$objDolibarr->duree_validite = $conf->global->PROPALE_VALIDITY_DURATION;
				
				$objDolibarr->cond_reglement_id = getCondReglementByLibelle($objStd->cond_reglement);
				
				dol_syslog('STANDALONE::interface.php case Propal cond_reglement'.$objDolibarr->cond_reglement_id,LOG_DEBUG);
				$objDolibarr->mode_reglement_id = getModeReglementByLibelle($objStd->mode_reglement);
				
				
				dol_syslog('STANDALONE::interface.php case Propal mode_reglement'.$objDolibarr->mode_reglement_id,LOG_DEBUG);
				dol_syslog('STANDALONE::interface.php case RESFETCH'.$resFetch,LOG_DEBUG);
				
				if($resFetch > 0 ){
					$sql="SELECT tms,rowid
						FROM ".MAIN_DB_PREFIX."propal
						WHERE rowid =".$objDolibarr->id_dolibarr;
					$res = $db->query($sql);
					if($res){
						$tms = $db->fetch_object($res);
						dol_syslog('STANDALONE::interface.php TMS DOLIBARR '.strtotime($tms->tms).' TMS LAST SYNCHRO '.$lastSynchro,LOG_DEBUG);

						if(strtotime($tms->tms)*1000>$lastSynchro){
							break;
						}
					}
					
					$objDolibarr->set_draft($user);
					$objDolibarr->id=$objStd->id_dolibarr;
					$objDolibarr->setPaymentMethods($objDolibarr->mode_reglement_id);
					$objDolibarr->setPaymentTerms($objDolibarr->cond_reglement_id );
					
					//suppression des lignes
					if(!empty($objDolibarr->lines)){
						$toDelete = true;
						foreach ($objDolibarr->lines as $li){

							foreach($objStd->lines as $liStd){
								if($li->id == $liStd->id){
									$toDelete = false;
								}
							}
							if($toDelete){
								$objDolibarr->deleteline($li->id);
							}
						}
					}
				}else {
					$objDolibarr->id = $objDolibarr->create($user);
				}
				
				
				
				dol_syslog('STANDALONE::interface.php case Propal id'.$objDolibarr->id,LOG_DEBUG);
				if(!empty($objStd->lines)){
					foreach($objStd->lines as $line){
						
				dol_syslog('STANDALONE::interface.php case Propal ref_line'.$line->ref,LOG_DEBUG);

						if(!empty($line->ref)){
							$sql = "SELECT rowid,label 
							FROM  `".MAIN_DB_PREFIX."product` 
							WHERE  `label` LIKE  '".$line->ref."'";
							$res = $db->query($sql);
							if($res){
								$existingProd = $db->fetch_object($res);
								if(!empty($line->id)){
									$objDolibarr->updateline($line->id, $line->subprice, $line->qty, $line->remise_percent,$line->tva_tx,0,0,$line->desc);
								
									
								}else {
									
									
									$objDolibarr->addline($line->ref, $line->subprice, $line->qty, $line->tva_tx, 0, 0, $existingProd->rowid,$line->remise_percent);
								}

							}
							else {
								if(!empty($line->id)){
									$objDolibarr->updateline($line->id, $line->subprice, $line->qty, $line->remise_percent,$line->tva_tx,0,0,$line->desc);
								}else {
									

									$objDolibarr->addline($line->ref, $line->subprice, $line->qty, $line->tva_tx, 0, 0, "",$line->remise_percent);
								}

							}
							
						}
							
					}
					if($objStd->statut >= 1){
						$user->rights->propal->creer = 1;
						$objDolibarr->valid($user);
						if($objStd->statut > 1){
							$objDolibarr->cloture($user, $objStd->statut, "", $notrigger=0);
						}
					}
					if($objStd->deleted_by_indexedDB){
						$objDolibarr->delete($user);
					}
					
				}
				if(!empty($objStd->signatureDataURL)){
					
					$upload_dir = DOL_DATA_ROOT.'/propale/'.$objDolibarr->ref.'/';
					$img = $objStd->signatureDataURL;
					$img = str_replace('data:image/png;base64,', '', $img);
					$img = str_replace(' ', '+', $img);
					$data = base64_decode($img);
					$file = $upload_dir . mktime() . ".png";
					$success = file_put_contents($file, $data);
					dol_syslog('STANDALONE::file_put_contents = '.$success);
				}
								
				// cas spéciale, pas de function update et il va falloir sauvegarder les lignes
                break;
            case 'Contact':
				
                $res = $resFetch > 0 ? $objDolibarr->update($objStd->id, $user) : $objDolibarr->create($user);
				if($objStd->deleted_by_indexedDB == 1){
					$objDolibarr->delete();
				}
				
				
                            
                break;
                            
            default:
				
			break;
		}
		
		$data = json_encode(array('classname == '.$classname));
		$str = '<script type="text/javascript">
					var data = '.$data.';
					window.parent.postMessage(data, "*");
				</script>';
		//return $str;
		
		/* TODO retour d'erreur non géré encore
		if ($res < 0)
		{
			$TError[] = $langs->trans('');
		}
		 * 
		 */
	}
	
	return $TError;
}

function getCondReglementByLibelle($cond_reglement)
{
	global $db;
	$sql = "SELECT rowid,libelle as label";
	$sql.= " FROM ".MAIN_DB_PREFIX.'c_payment_term';
	$sql.= " WHERE active > 0 AND libelle LIKE '%".$cond_reglement."%'";
	$sql.= " ORDER BY sortorder";
	dol_syslog('STANDALONE::interface.php case Propal cond_reglement =>'.$cond_reglement,LOG_DEBUG);
			
	$res = $db->query($sql);
	if($res){
		$obj = $db->fetch_object($res);
			dol_syslog('STANDALONE::interface.php case Propal cond_reglement =>=>'.$obj->rowid,LOG_DEBUG);

		if($obj){
			return $obj->rowid;
					
		} else {
			return 1;
		}
					
	}else {
		return 1;
	}
}

function getModeReglementByLibelle($mode_reglement)
{
	global $db;
	$sql = "SELECT id,libelle as label";
	$sql.= " FROM ".MAIN_DB_PREFIX.'c_paiement';
	$sql.= " WHERE active > 0 AND libelle LIKE '%".$mode_reglement."%'";
	$sql.= " ORDER BY id";
		dol_syslog('STANDALONE::interface.php case Propal $mode_reglement =>'.$mode_reglement,LOG_DEBUG);

	$res = $db->query($sql);
	if($res){
		$obj = $db->fetch_object($res);
		dol_syslog('STANDALONE::interface.php case Propal cond_reglement =>=>'.$obj->id,LOG_DEBUG);

		if($obj){
			return $obj->id;
	
		} else {
			return 1;
		}
			
	}else {
		return 1;
	}
}