//modulos externos
const chalk = require('chalk');
const inquirer = require('inquirer');

//modulos internos
const fs = require('fs');
const { parse } = require('path');

console.log(chalk.blue("Iniciamos o Accounts"));
operation();
//Operações disponiveis no sistema

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'o que voce deseja fazer ?',
        choices: ['Criar conta', 'Consultar saldo', 'Depositar', 'Sacar', 'Sair']
    },
    ]).then((answer => {
        const action = answer['action'];

        if (action === 'Criar conta') {
            createAccount();
        }

        else if (action === 'Consultar saldo') {
            getAccountBalance();
        }

        else if (action === 'Depositar') {
            deposit();
        }

        else if (action === 'Sacar') {
            withDraw();
        }

        else if (action === 'Sair') {
            exitProgram();
        }



    })).catch((err) => console.log(err));
}

function createAccount() {
    console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
    console.log(chalk.green("Defina as opções de sua conta: "));
    buildAccount();
}

function buildAccount() {

    inquirer.prompt([
        {
            name: 'AccountName',
            message: 'Digite um nome para sua conta: '
        },
    ]).then(answer => {
        const AccountName = answer['AccountName'];
        console.info(AccountName);

        //verificar se existe o diretorio accounts, se nao tiver irá criar um 
        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts');
        }

        //verifica se a conta ja existe
        if (fs.existsSync(`accounts/${AccountName}.json`)) {
            console.log(chalk.bgRed.black('Essa conta ja existe, escolha outro nome!'));
            return buildAccount();
        }

        //criar um arquivo.js com o nome da conta e o saldo
        fs.writeFileSync(`accounts/${AccountName}.json`
            , '{"balance": 0}'
            , function (err) {
                console.log(err);
            },
        )
        console.log(chalk.green("Parabéns sua conta foi criada!"));
        operation();
    }).catch(err => console.log(err));

}

//finaliza o programa
function exitProgram() {
    console.log(chalk.blue("Obrigado por utilizar o Account !"));
    process.exit();
}

//add um valor na conta do usuario
function deposit(){

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        },
    ]).then((answer)=>{
        const accountName = answer['accountName'];

        // verifica se a conta existe
        if(!checkAccount(accountName)){
            return deposit();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar ? '
            }
        ]).then((answer) => {

            const amount = answer['amount'];

            //add valor
            addAmount(accountName,amount);
            operation();

        }).catch(err => console.log(err));


    }).catch(err => console.log(err));
}
// verifica se a conta existe
function checkAccount(accountName){
    if(!fs.existsSync(`accounts/${accountName}.json`)){
        console.log(chalk.bgRed.black('Está conta não existe, tente novamente!'));
        return false;
    }
    return true;
}

function addAmount(accountName, amount){
    const accountData = getAccount(accountName);

    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde !'));
        return deposit();
    }

   accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
   
   fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function(err){
        console.log(err);
    }
   )
   console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta !`),
   )
}

function getAccount(accountName){
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`,
    {
        enconding: 'utf8',
        flag: 'r'
    });
    return JSON.parse(accountJSON);
}

//mostrar saldo
function getAccountBalance(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer["accountName"]

        // verify if account exists
        if(!checkAccount(accountName)){
            return getAccountBalance()
        }

        const accountData = getAccount(accountName);

        console.log(chalk.green(`Olá o saldo da sua conta é de R$${accountData.balance} reais `),
        )
        operation();
    }).catch(err => console.log(err));
}

//sacar um valor da conta do usuario 
function withDraw(){
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) =>{

        const accountName = answer['accountName'];

        if(!checkAccount(accountName)){
            return withDraw();
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto voce deseja sacar?'
            }
        ]).then((answer) => {
            const amount = answer['amount']
            removeAmount(accountName, amount);

        }).catch(err => console.log(err));

    }).catch(err => console.log(err));
}

function removeAmount(accountName, amount){

    const accountData = getAccount(accountName)
    
    //verifica se tem algum valor para sacar
    if(!amount){
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde'),
        );
        return withDraw();
    }

    //verifica se o valor para sacar é maior do que o disponível na conta
    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível'));
        return withDraw();
    }

    //salvando o valor de saque na conta 
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err){
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi realizado um saque de R$${amount} na sua conta!`),
    );
    operation();
}