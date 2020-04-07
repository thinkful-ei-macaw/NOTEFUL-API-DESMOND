const FolderService= {
    getFolder(knex){
    return knex.select('*').from('folder_table')
},

getById(knex,id){
    return knex
    .from('folder_table')
    .select('*')
    .where('id',id)
    .first()
},

addFolder(knex,folder){
    return knex
    .into('folder_table')
    .insert(folder)
    .returning('*')
    .then(rows => rows[0])

},

deleteFolder(knex,id){
    return knex 
    .from('folder_table')
    .where('id',id)
    .delete()
},

updateFolder(knex,id,data){
    return knex 
    .from('folder_table')
    .where('id',id)
    .update(data)
},

};

module.exports = FolderService;