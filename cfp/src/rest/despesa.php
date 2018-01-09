<?php
// rest : despesa

/*
	Projeto: CFP - (Controle Financeiro Pessoal).
	Project Owner: Adelson Guimarães.
	Desenvolvedor: Adelson Guimarães Monteiro.
	Data de início: 09/01/2018.
	Data Atual: 09/01/2018.
*/

//inclui autoload
require_once 'autoload.php';

//verifica requisição
switch ($_POST['metodo']) {
	case 'cadastrar':
		cadastrar();
		break;
	case 'buscarPorId':
		buscarPorId();
		break;
	case 'listar':
		listar();
		break;
	case 'atualizar':
		atualizar();
		break;
	case 'deletar':
		deletar();
		break;
}

function cadastrar () {
	$data = $_POST['data'];
	$obj = new Despesa(
		NULL,
		new Usuario($data['idusuario']),
		new Tipo($data['idtipo']),
		$data['descricao'],
		$data['ativo']
	);
	$control = new DespesaControl($obj);
	$response = $control->cadastrar();
	echo json_encode($response);
}
function buscarPorId () {
	$data = $_POST['data'];
	$control = new DespesaControl(new Despesa($data['id']));
	$response = $control->buscarPorId();
	echo json_encode($response);
}
function listar () {
	$control = new DespesaControl(new Despesa);
	$response = $control->listar();
	echo json_encode($response);
}
function atualizar () {
	$data = $_POST['data'];
	$obj = new Despesa(
		$data['id'],
		new Usuario($data['idusuario']),
		new Tipo($data['idtipo']),
		$data['descricao'],
		$data['ativo']
	);
	$control = new DespesaControl($obj);
	$response = $control->atualizar();
	echo json_encode($response);
}
function deletar () {
	$data = $_POST['data'];
	$banco = new Despesa();
	$banco->setId($data['id']);
	$control = new DespesaControl($banco);
	echo json_encode($control->deletar());
}


// Classe gerada com BlackCoffeePHP 2.0 - by Adelson Guimarães
?>