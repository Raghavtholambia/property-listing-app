const User = require("./users"); // adjust path if needed

 (async () => {
    console.log("MongoDB Connected");

    const users = await User.find({});
    console.log("All Users:", users);
  })()
