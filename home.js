/* qual o objetivo dessa função? 
   1 - acessar o localStorage e ver se existe um item chamado ScheduleUSER
       se tiver, recupera, trata e usa as informações para preencher as lacunas dos dados do 
       usuario
   2 - se não existir esse item? retorna para o index (sinal que não tem usuário conectado)
*/
var relatorio;
var linharel = "{{PROTO}};{{CLI}};{{EMAIL}};{{CEL}};{{AG}};{{DATA}};{{HORA}};{{OBS}}\n";
var templateFoto = `<img src="{{LINKFOTO}}" width="100%">`;
var templateInfo = `Funcional: {{FUNCIONAL}} <br>
                    Nome: {{NOME}} <br>
                    Email: {{EMAIL}} <br>
                    RACF: {{RACF}} <br>
                    Departamento: {{DEPARTAMENTO}} / {{UNIDADE}}`;
                    
function carregarInfoUsuario(){
    var userSTR = localStorage.getItem("ScheduleUSER");
    if (!userSTR){    // o objeto não existe no Local Storage
        window.location = "index.html";
    }
    else{
        // vou ter que converter de STRING para Objeto
        var user = JSON.parse(userSTR);

        document.getElementById("fotoUSER").innerHTML = templateFoto.replace("{{LINKFOTO}}",user.linkFoto);

        var infoUser = templateInfo.replace("{{NOME}}", user.nome)
                                   .replace("{{EMAIL}}", user.email)
                                   .replace("{{RACF}}",  user.racf)        
                                   .replace("{{FUNCIONAL}}", user.funcional)
                                   .replace("{{DEPARTAMENTO}}", user.depto.nome)    
                                   .replace("{{UNIDADE}}", user.depto.unidade);
        document.getElementById("infoUSER").innerHTML = infoUser;  
        
        // agora vou carregar os dados da agencia
        carregaAgencias();
    }


}

    

function carregaAgencias(){
   fetch("http://localhost:8088/agencias")
    .then(res => res.json())
    .then(listaAgencias => preencheComboBox(listaAgencias)); 
}

function preencheComboBox(listaAgencias){
    var templateSelect = `<select class="form-control" id="selectAg"> {{OPCOES}} </select> `;
    var templateOption = `<option value="{{VALOR}}"> {{NOME}} </option>`;
    
    var opcoes = "";
    for (i=0; i<listaAgencias.length; i++){
        var ag = listaAgencias[i];
        opcoes = opcoes + templateOption.replace("{{VALOR}}", ag.id)
                                        .replace("{{NOME}}", ag.nome);
    }
    var novoSelect = templateSelect.replace("{{OPCOES}}", opcoes);
    document.getElementById("optionAgencia").innerHTML = novoSelect;
}


function gerarRelatorio(){
    // para saber se tá todo mundo "checado"
    var combinacao = 0;
    if (document.getElementById("selectAgencia").checked){
        combinacao = combinacao + 1;
    } 
    if (document.getElementById("selectData").checked){
        combinacao = combinacao + 2;
    } 
    if (document.getElementById("selectCliente").checked){
        combinacao = combinacao + 4;
    } 
    console.log("Combinacao = "+combinacao);
   
    var op = document.getElementById("selectAg");
    console.log(op.options[op.selectedIndex].value);
    console.log(document.getElementById("txtData").value);
    console.log(document.getElementById("txtCliente").value);
    var txtData = document.getElementById("txtData").value;
    var txtNovaData = txtData.substr(8,2)+"/"+txtData.substr(5,2)+"/"+txtData.substr(0,4);

    var url = "http://localhost:8088/agendamentos";
    // preciso complementar todas as URL 
    if (combinacao == 0){
        url = url + "/todos";
    }
    else if (combinacao == 1){
        url = url + "/filtrarporagencia?agencia="+op.options[op.selectedIndex].value;
    }
    else if (combinacao == 2){
        url = url + "/filtrarpordata?data_agendamento="+txtNovaData;
    }
    else if (combinacao == 3){
        url = url + "/filtrarporagenciadata?agencia="+op.options[op.selectedIndex].value+"&data_agendamento="+txtNovaData;
    }
    else if (combinacao == 4){
        url = url + "/filtarporcliente?nomecli="+document.getElementById("txtCliente").value;
    }
    else if (combinacao == 5){
        url = url + "/filtarporclienteagencia?nomecli="+document.getElementById("txtCliente").value+"&agencia="+op.options[op.selectedIndex].value;
    }
    else if (combinacao == 6){
        url = url + "/filtrarpordatacliente?data_agendamento="+txtNovaData+"&nomecli="+document.getElementById("txtCliente").value;
    }
    else if (combinacao == 7){
        url = url + "/filtrarporagenciadatacliente?agencia="+op.options[op.selectedIndex].value+"&data_agendamento="+txtNovaData+"&nomecli="+document.getElementById("txtCliente").value;
    }
    

    fetch(url)
       .then(res => res.json())
       .then(res => trataRelatorio(res));
       //.then(res => preencheRelatorio(res)); 
}
/*
function preencheRelatorio(res){
    relatorio = res;
    var templateLinha = `<div class="row">
                <div class="col-1"> {{PROTO}} </div>
                <div class="col-2"> {{CLI}} </div>
                <div class="col-2"> {{EMAIL}} </div>
                <div class="col-2"> {{CEL}} </div>
                <div class="col-1"> {{AG}} </div>
                <div class="col-2"> {{DATAHORA}} </div>
                <div class="col-2"> {{OBS}} </div>
       </div>`;

       var rel = "";
       for (i=0;i<res.length; i++){
           var ag = res[i];
           rel += templateLinha.replace("{{PROTO}}", ag.num_seq)
                               .replace("{{CLI}}", ag.nomeCliente)
                               .replace("{{EMAIL}}", ag.emailCliente)
                               .replace("{{CEL}}", ag.celularCliente)
                               .replace("{{AG}}", ag.agencia.nome)
                               .replace("{{DATAHORA}}", ag.dataAgendamento+"-"+ag.horaAgendamento)
                               .replace("{{OBS}}", ag.observacoes);
       }
       document.getElementById("relatorio").innerHTML = rel;
}
*/

function logout(){
    localStorage.removeItem("ScheduleUSER");
    window.location = "index.html";
}

function trataRelatorio(res) {
    relatorio = res;
    // alert ("passou por aqui");
    var rel = "<br><table border=2 width='100%'>";
    rel += "<tr><th>Agencia</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Data</th><th>Hora</th><th>Obs</th></tr>";
    for(i=0 ; i < res.length; i++){
        var ag= res[i];
        rel += "<tr>" + "<td>"+ ag.agencia.nome + "</td>" + "<td>" + ag.nomeCliente + "</td>" + "<td>" + ag.emailCliente + "</td>"+ "<td>" + ag.celularCliente + "</td>" + "<td>" + ag.dataAgendamento + "</td>"+ "<td>" + ag.horaAgendamento + "</td>" + "<td>" + ag.observacoes + "</td>" + "</tr>";
    }
    rel += "</table><br>";
    console.log(rel);
    document.getElementById("relatorio").innerHTML = rel;

}


function gerarCSV(){
    
    var rel = "";
    for (i=0 ; i < relatorio.length ; i++){
        var ag = relatorio[i];
        rel += linharel.replace("{{PROTO}}", ag.num_seq)
                               .replace("{{CLI}}", ag.nomeCliente)
                               .replace("{{EMAIL}}", ag.emailCliente)
                               .replace("{{CEL}}", ag.celularCliente)
                               .replace("{{AG}}", ag.agencia.nome)
                               .replace("{{DATA}}", ag.dataAgendamento)
                               .replace("{{HORA}}", ag.horaAgendamento)
                               .replace("{{OBS}}", ag.observacoes);
    }
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(rel);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'relatorio.csv';
    hiddenElement.click();
}



/*
function gerarRelatorio(){
    fetch("http://localhost:8088/agendamentos/todos")
        .then(res => res.json())
        .then(res => trataResultado(res));
}
 
function trataResultado(res){
    var rel = "";
    for(i=0; i<res.length;i++){
        var ag = res[i];
        rel+=ag.num_seq + "-" + ag.nomeCliente + "-" + ag.emailCliente + "-" + ag.celularCliente +"<br>";
    }
    document.getElementById("relatorio").innerHTML = rel;
}
*/