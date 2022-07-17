const express = require('express');
const path = require('path')
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const hostname = "0.0.0.0";
const port = process.env.PORT || 3000;
const dbSecret = process.env['DBSECRET'];

// added body-parser middleware for forms
app.use(bodyParser.urlencoded({extended: false}));

// added view engine: ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname + '/views'));



app.get('/tasks', async (req, res) => {
    
    const tasks = await showAllTasks();
    
    res.render('task', {
         tasks: tasks,
         howTime: howTime
    });

});

app.post('/addTask', async (req, res) => {
    
    
    try {
        await createNewTask(req.body.task, req.body.timeToDone);
        res.redirect('/tasks');

    } catch (error) {
        const tasks = await showAllTasks();

        res.render('task', {
         tasks: tasks,
         howTime: howTime,
         errors: error.errors
        });
    }

});

app.get('/deleteTask/:id', async (req, res) => {
    
    await deleteTask(req.params.id)
    res.redirect('/tasks');

});

app.post('/taskDoneSwitch/:id', async (req, res) => {
    
    await taskDoneSwitch(req.params.id)
    res.redirect('/tasks');

});


app.get('/tasks/edit/:id', async (req, res) => {
    
    const tasks = await showAllTasks();
    const taskEdit = await Task.findById(req.params.id);

    res.render('taskEdit', {
         tasks: tasks,
         taskEdit: taskEdit,
         howTime: howTime
    });

});

app.post('/tasks/edit/:id', async (req, res) => {
    
    

    try {
        await editTask(req.params.id,req.body.task, req.body.timeToDone);
        res.redirect('/tasks');

    } catch (error) {
        const tasks = await showAllTasks();
        const taskEdit = await Task.findById(req.params.id);

        res.render('taskEdit', {
            tasks: tasks,
            taskEdit: taskEdit,
            howTime: howTime,
            errors: error.errors
       });
    }

});


app.listen(port, hostname);

// łączenie z bazą danych oraz funkcje do obsługi aplikacji z bazą

mongoose.connect(dbSecret, { ssl: true });
const { Schema } = mongoose;


const taskSchema = new Schema({
  task:  {
    type: String,
    required: [true, 'Proszę uzupełnić task']
  },
  timeToDone: { type: Date, default: Date.now },
  done: { type: Boolean, default: false }

}, { timestamps: { createdAt: 'created_at' } });

const Task = mongoose.model('Task', taskSchema);


async function createNewTask(taskTopic, timeToDone) {
    const task = new Task();
    task.task = taskTopic;
    if(timeToDone == "") {
        task.timeToDone = '';
    } else {
        task.timeToDone = timeToDone;
    }
   
    await task.save();
}

async function editTask(taskId,taskTopic, timeToDone) {
    const task = await Task.findById(taskId);
    task.task = taskTopic;
    if(timeToDone == "") {
        task.timeToDone = '';
    } else {
        task.timeToDone = timeToDone;
    }
    await task.save();
}


async function deleteTask(taskId) {
    const task = await Task.findByIdAndDelete(taskId);
}


async function taskDoneSwitch(taskId) {
    const task = await Task.findById(taskId);
    task.done = !task.done;
    await task.save();
}

async function showAllTasks() {
    const allTasks = await Task.find().sort({ _id: -1 });
    return allTasks;
}





//taskDoneSwitch('61e5aff23dcb5ca973d5fff2');

//createNewTask('Kup mleko', '10-10-2022');
//createNewTask('Kup parowki', '10-8-2022');
//createNewTask('Kup napiot', '10-5-2022');

//editTask('61e5aff23dcb5ca973d5fff2', 'zrobic gołfra', '12.12.2022 15:30');

function howTime(countDownDate) {
    
    // Get today's date and time
    let now = new Date().getTime();
    let countDownDateM = countDownDate.getTime();
    // Find the distance between now and the count down date
    var distance = countDownDateM - now;
      
    // Time calculations for days, hours, minutes and seconds

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      
    // Output the result in an element with id="demo"

    if(days <= 0 && hours <= 0 && minutes <= 0) {
        return "Czas minął ";
    } else if(days <= 0 && hours <= 0) {
        return "Pozostało " + minutes + "min ";
    } else if(days <= 0) {
        return "Pozostało " + hours + "h " + minutes + "min ";
    } else {
        return "Pozostało " + days + "dni " + hours + "h " + minutes + "min ";
    }
    
};






