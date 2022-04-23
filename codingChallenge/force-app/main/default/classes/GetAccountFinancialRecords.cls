public with sharing class GetAccountFinancialRecords {
    public GetAccountFinancialRecords() {    }

    /*@AuraEnabled(cacheable=true)
    public static List<Account> getAccountFinancialRecords(){
        try {
            List<Account> accRecords = [Select Id , Name, Owner.Name, AnnualRevenue, Phone, Website FROM Account WHERE Industry=:'Financial Services'];
            if(!accRecords.isEmpty()){
                return accRecords;
            }
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }*/

    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountFinancialRecords(String searchText){
        try {
            string query = 'Select Id , Name, Owner.Name, AnnualRevenue, Phone, Website FROM Account';
            query += ' WHERE Industry = \''+'Financial Services'+'\'';
            if(searchText.length()>0){
                searchText = '\'%' + String.escapeSingleQuotes(searchText.trim()) + '%\'';
                query += ' AND Name LIKE '+searchText;
            }
            System.debug('Query::'+query);
            System.debug('searchText::'+searchText);
            List<Account> accRecords = Database.query(query);
            System.debug('Records::'+accRecords);
            if(!accRecords.isEmpty()){
                return accRecords;
            }
            return null;
        } catch (Exception e) {
            System.debug('Error : '+e.getMessage()+ '  ::  '+e.getLineNumber());
            throw new AuraHandledException(e.getMessage());
        }
    }
}