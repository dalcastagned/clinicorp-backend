const Joi = require('joi')
const { StatusCodes } = require('http-status-codes')

const taskSchema = Joi.object({
  description: Joi.string().min(3).required().messages({
    'string.base': 'O campo descrição deve ser um texto',
    'string.min': 'O campo descrição deve ter no mínimo 3 caracteres',
    'any.required': 'O campo descrição é obrigatório',
  }),
  responsable: Joi.string().min(2).required().messages({
    'string.base': 'O campo responsável deve ser um texto',
    'string.min': 'O campo responsável deve ter no mínimo 2 caracteres',
    'any.required': 'O campo responsável é obrigatório',
  }),
  status: Joi.string().valid('todo', 'doing', 'done').required().messages({
    'any.only': 'O campo status deve ser "todo", "doing" ou "done"',
    'any.required': 'O campo status é obrigatório',
    'string.base': 'O campo status deve ser um texto',
  }),
})

const insertTasksSchema = Joi.array().items(taskSchema).min(1).required().messages({
  'array.base': 'A lista de tarefas deve ser um array',
  'array.min': 'É necessário enviar pelo menos uma tarefa',
  'any.required': 'O corpo da requisição é obrigatório',
})

const validateInsertTasks = (req, res, next) => {
  const { error } = insertTasksSchema.validate(req.body)
  if (error) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Erro de validação.',
      details: error.details.map(d => d.message).join(', '),
    })
  }
  next()
}

module.exports = {
  validateInsertTasks,
}
