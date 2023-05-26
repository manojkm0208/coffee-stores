import { findRecordByFlter } from "@/lib/airtable";

const getCoffeeStoreById = async (req, res) => {
  const {id} = req.query;
  try{
    if(id){
      const records = await findRecordByFlter(id);
      if(records.length !== 0){
          res.json(records);
      } else {
          res.json({ message: "id could not be found"});
      }
    } else {
      res.status(400)
      res.json({ message: "Id is missing"});
    }
  } catch(error) {
    res.json(500);
    res.json({ message: "Something went wrong", error});
  }
}

export default getCoffeeStoreById;