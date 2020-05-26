/**Controller to manage store of scopes endpoint
 * @module routes/products/controller
 */
const { nanoid } = require('nanoid');

const TABLE_SCOPES = 'Scopes';

function controllerScopes(injectedStore){
    let store = injectedStore;
    if (!store) {
        store = require('../../store/mysql');
    }
    /**
     * Logic to insert a Scope.
     * @param {Object} body - The Scope information 
     * @returns {Promise<object[]>} res - result of Scope insertion
     */
    async function insertScope(body) {
        const scope = {
            id_module_access: nanoid(),
            module: body.module,
            endpoint: body.endpoint,
            id_security_levels: body.id_security_levels,
        }
            return await store.insert(TABLE_SCOPES, scope);
    }

    /**
     * Logic to delete a scope
     * @method PUT 
     * @param {id} - The id of the Scope to be deleted
     * @returns {Object} res - result of Scope delete operation
    */
    async function deleteScope(id) {
        /**
         * @const {id} - object to insert into product table
         */
        const deleteScope = `DELETE FROM  ${TABLA_PRODUCTS} WHERE id_module_access='${id}'`;
        return await store.remove(deleteScope);
    }

    /**
     * Logic to list all Scopes of the store.
     * @returns {Promise<object[]>} res - List of Scopes
     */
    async function listScopes(idSecurity){
        const query = `select concat(M.endpoint,":",M.module) as access 
            FROM ${TABLE_SCOPES} p 
            WHERE id_security_levels = ${idSecurity}`;
        let result = await store.get(query);
        let scopes = [];
        result.forEach((item) => {
          scopes.push(item.access);
        })
        return scopes;
    }
    return {
        insertScope,
        deleteScope,
        listScopes
    }
}

module.exports = controllerProducts;