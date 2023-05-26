import { findRecordByFlter, getMinifiedRecords, table } from "@/lib/airtable";

const favouriteCoffeeStoreById = async (req, res) => {
  if(req.method === "PUT"){
    try {
      const {id} = req.body;
      if(id){
        const records = await findRecordByFlter(id);

        if(records.length !== 0){
            const record = records[0];

            const calculateVouting = parseInt(record.voting) + 1;
            
            //update a record

            const updateRecord = await table.update([
              {
                id: record.recordId,
                fields: {
                  voting: calculateVouting
                }
              }
            ])

            if(updateRecord){
              const minifiedRecord = getMinifiedRecords(updateRecord);
              res.json(minifiedRecord);
            }

        } else {
            res.json({message: "Coffee store id doesn't exist", id});
        }
      } else {
        res.status(400);
        res.json({message: "Id is missing"})
      }
    } catch(error) {
      res.status(500);
      res.json({message: "Error upvoting coffee store", error})
    }
  }
}

export default favouriteCoffeeStoreById;