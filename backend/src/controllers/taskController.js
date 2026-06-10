const prisma = require("../config/prisma");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assignedUserId,
    } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({
        message: "Task basligi ve projectId zorunludur",
      });
    }

    const existingProject = await prisma.project.findUnique({
      where: {
        id: Number(projectId),
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        message: "Proje bulunamadi",
      });
    }

    if (assignedUserId) {
      const existingUser = await prisma.user.findUnique({
        where: {
          id: Number(assignedUserId),
        },
      });

      if (!existingUser) {
        return res.status(404).json({
          message: "Atanacak kullanici bulunamadi",
        });
      }
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: Number(projectId),
        assignedUserId: assignedUserId ? Number(assignedUserId) : null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Task basariyla olusturuldu",
      task: newTask,
    });
  } catch (error) {
    console.error("createTask hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Tasklar getirildi",
      tasks,
    });
  } catch (error) {
    console.error("getTasks hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task bulunamadi",
      });
    }

    const { title, description, priority, dueDate, assignedUserId } = req.body;

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        title: title ?? existingTask.title,
        description: description ?? existingTask.description,
        priority: priority ?? existingTask.priority,
        dueDate: dueDate ? new Date(dueDate) : existingTask.dueDate,
        assignedUserId:
          assignedUserId !== undefined
            ? assignedUserId === null
              ? null
              : Number(assignedUserId)
            : existingTask.assignedUserId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Task basariyla guncellendi",
      task: updatedTask,
    });
  } catch (error) {
    console.error("updateTask hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const taskId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ["TODO", "IN_PROGRESS", "DONE"];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Gecerli bir status gondermelisiniz",
      });
    }

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task bulunamadi",
      });
    }

    const isManager = req.user.role === "MANAGER";
    const isAssignedUser = existingTask.assignedUserId === req.user.id;

    if (!isManager && !isAssignedUser) {
      return res.status(403).json({
        message: "Bu task statusunu degistirme yetkiniz yok",
      });
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId,
      },
      data: {
        status,
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: "Task status guncellendi",
      task: updatedTask,
    });
  } catch (error) {
    console.error("updateTaskStatus hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const existingTask = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task bulunamadi",
      });
    }

    await prisma.task.delete({
      where: {
        id: taskId,
      },
    });

    return res.status(200).json({
      message: "Task basariyla silindi",
    });
  } catch (error) {
    console.error("deleteTask hatasi:", error);
    return res.status(500).json({
      message: "Sunucu hatasi",
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
