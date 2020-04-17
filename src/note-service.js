const NoteService={
getNote(knex){
    return knex.select('*').from('note_table')
},

getNotebyId(knex, id){
    return knex
    .from('note_table')
    .select()
    .where('id',id)
    .first()
},

addNote(knex,newNote){
    return knex
    .into('note_table')
    .insert(newNote)
    .returning('*')
    .then(rows => rows[0])
},

deleteNote(knex,id){
    return knex
    .from('note_table')
    .where('id',id)
    .delete()
    
},

updateNote(knex,id,data){
    return knex
    .from('note_table')
    .where('id',id)
    .update(data)
}



};

module.exports = NoteService;