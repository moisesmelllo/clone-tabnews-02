class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    this.field = field;
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
    this.statusCode = 500;
  }
}

async function buscarUsuario(usuario) {
  console.log(usuario);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new DatabaseError("Falha na conexão"));
    }, 1000);
  });
}

async function executar() {
  try {
    await buscarUsuario("ana");
  } catch (error) {
    tratarErro(error);
  }
}

function tratarErro(error, req, res, next) {
  if (error instanceof ValidationError) {
    console.log(`Erro de validação: ${error.message} no campo ${error.field}`);
    return res.statusCode;
  } else if (error instanceof DatabaseError) {
    console.log(`Erro do servidor: ${error.message}`);
    console.log(res);
  } else {
    console.log(`Erro nao identificado: ${error}`);
  }
}

executar();
