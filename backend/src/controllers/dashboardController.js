const prisma  = require("../config/prisma");
const  getSummary = async (req,res)=>{
  try {

    const totalProjects = await prisma.project.count();
    const totalTask = await prisma.task.count();
    const todoTask = await prisma.task.count({
      where : {
        status : "TODO",
      }
    });
    const inProgressTask = await  prisma.task.count({
      where: {
        status : "IN_PROGRESS",
      }
    });
    const doneTask = await prisma.task.count({
      where : {
        status : "DONE",
      }
    });

    const comlationRate = totalTask === 0 ? 0 : Number(((doneTask/totalTask)*100).toFixed(2));
    return  res.status(200).json({
      message : "Dashboard Özet Bilgileri Getirildi",
      summary : {
        totalProjects,
        totalTask,
        todoTask,
        inProgressTask,
        doneTask,
        comlationRate
      },
    })

  }catch (error){
    console.error("Yükleneme Hatası",error);
    return res.status(500).json({
      message: "Sunucu Hatası"
    })
  }
}
const getWorkload = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tasks: {
          where: {
            status: {
              in: ["TODO", "IN_PROGRESS"],
            },
          },
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    const workload = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      activeTaskCount: user.tasks.length,
      tasks: user.tasks,
    }));

    return res.status(200).json({
      message: "Ekip is yukleri getirildi",
      workload,
    });
  } catch (error) {
    console.error("dashboard workload hatasi", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

module.exports = {
  getSummary,
  getWorkload,
};
