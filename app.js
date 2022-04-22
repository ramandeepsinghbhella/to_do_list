//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://ramandeepsinghbhella:raman@12345@cluster0.3ybxc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/todolistDB", {useNewUrlParser: true})
.then(() => console.log("Database connected!"))
.catch(err => console.log(err));

const itemSchema = {
  name: String
};

const Item = new mongoose.model("Item", itemSchema)

const item1 = new Item ({
  name: "gym"
});

const item2 = new Item ({
  name: "diet"
});

const item3 = new Item ({
  name: "sleep"
});

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemSchema]
};

const list = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, founditems){
    if(founditems.length === 0){
      Item.insertMany(defaultItems, function(err){
          if (err){
            console.log(err);
          }
          else{
            console.log("default list is inserted");
          }
        });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
  })
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  list.findOne({name: customListName},  function(err, foundList){
    if (!err){
      if (!foundList){
        const List = new list ({
          name: customListName,
          items: defaultItems
        });
        List.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    list.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  
});

app.post("/delete", function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;
  
  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItem, function(err){
      if (err){
        console.log(err);
      }
      else{
        console.log("item deleted");
      }
      res.redirect("/");
    });
  }
  else{
    list.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}, function(err, founditems){
      if(!err){
          res.redirect("/" + listName);
      }
    });
  }
  
  
  
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
