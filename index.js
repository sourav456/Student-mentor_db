const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const dbUrl = "mongodb+srv://sourav345:Qwerty123@cluster0.7plwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

app.get("/", (req, res) => {
  res.send("Server is running");
});

//Create mentor
app.post("/create-mentor", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  try {
    let db = client.db("student-mentor");
    let mentor = await db.collection("mentors").insertOne(req.body);
    res.status(200).json({
      message: "Mentor Created Successfully",
    });
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//Create student
app.post("/create-student", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  try {
    let db = client.db("student-mentor");
    let student = await db.collection("students").insertOne({
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      mentor: "",
    });
    res.status(200).json({
      message: "Student Created Successfully",
    });
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//Get all mentors
app.get("/all-mentors", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  try {
    let db = client.db("student-mentor");
    let allMentors = await db.collection("mentors").find().toArray();
    res.status(200).json(allMentors);
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//Get all students
app.get("/all-students", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  try {
    let db = client.db("student-mentor");
    let allStudents = await db.collection("students").find().toArray();
    res.status(200).json(allStudents);
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//Assign mentor to student 
app.put("/assign-mentor", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  const mentorObjId = mongodb.ObjectID(req.body.mentorId);
  const studentObjId = mongodb.ObjectID(req.body.studentId);
  try {
    let db = client.db("student-mentor");
    let mentor = await db.collection("mentors").findOne({ _id: mentorObjId });

    await db
      .collection("students")
      .updateOne({ _id: studentObjId }, { $set: { mentor: mentor.name } });
    res.status(200).json({
      message: "Mentor assigned successfully",
    });
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//Add students to mentor 
app.put("/add-students", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  const mentorObjId = mongodb.ObjectID(req.body.mentorId);

  try {
    let db = client.db("student-mentor");
    let mentor = await db.collection("mentors").findOne({ _id: mentorObjId });

    req.body.selectedStudents.map((selectedStudentId) => {
      const studentObjId = mongodb.ObjectID(selectedStudentId);
      db.collection("students").updateOne(
        { _id: studentObjId },
        { $set: { mentor: mentor.name } }
      );
    });
    res.status(200).json({
      message: "Students added successfully",
    });
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//All assigned students 
app.post("/assigned-students", async (req, res) => {
  const client = await mongoClient.connect(dbUrl);
  const mentorObjId = mongodb.ObjectID(req.body.mentorId);

  try {
    let db = client.db("student-mentor");
    let mentor = await db.collection("mentors").findOne({ _id: mentorObjId });

    let assignedStudents = await db
      .collection("students")
      .find({ mentor: mentor.name })
      .toArray();
    res.status(200).json(assignedStudents);
  } catch (error) {
    res.sendStatus(500);
  } finally {
    client.close();
  }
});

//Server
app.listen(PORT, () => {
  console.log(`Server listen in port : ${PORT}`);
});