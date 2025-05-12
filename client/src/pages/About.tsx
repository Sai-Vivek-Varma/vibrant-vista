import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const About = () => {
  // Team members data
  const teamMembers = [
    {
      name: "Sai Vivek Varma",
      role: "Founder & Editor-in-Chief",
      bio: "Vivek founded VibrantVista in 2025 with a vision to create a platform where passionate writers could share their ideas with the world.",
      image: "",
    },
  ];

  // Timeline items
  const timelineItems = [
    {
      year: 2025,
      title: "VibrantVista Launches",
      description:
        "Our platform goes live with a focus on technology and lifestyle content.",
    },
    {
      year: 2025,
      title: "First 10,000 Readers",
      description:
        "We reach our first major milestone with 10,000 monthly active readers.",
    },
    {
      year: 2025,
      title: "Community Features",
      description:
        "Launch of comments, bookmarks, and user profiles to foster community engagement.",
    },
    {
      year: 2025,
      title: "Mobile App Release",
      description:
        "Introduction of our native mobile app for iOS and Android platforms.",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className='min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-grow'>
        {/* Hero Section */}
        <section className='bg-gradient-to-br from-primary/10 to-secondary/5 py-16 md:py-24'>
          <div className='container mx-auto px-4 text-center'>
            <motion.h1
              className='text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              About <span className='text-primary'>Vibrant</span>
              <span className='text-secondary'>Vista</span>
            </motion.h1>

            <motion.p
              className='text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              We're a collective of passionate writers, editors, and creators
              dedicated to bringing you insightful and engaging content across a
              variety of topics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <div className='relative w-32 h-32 mx-auto mb-8'>
                <div className='absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse opacity-70'></div>
                <div className='absolute inset-2 rounded-full bg-white flex items-center justify-center'>
                  <h2 className='text-2xl font-bold font-serif text-primary'>
                    VV
                  </h2>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className='py-16'>
          <div className='container mx-auto px-4'>
            <Tabs defaultValue='mission' className='max-w-4xl mx-auto'>
              <TabsList className='grid grid-cols-3 mb-8'>
                <TabsTrigger value='mission'>Our Mission</TabsTrigger>
                <TabsTrigger value='team'>Our Team</TabsTrigger>
                <TabsTrigger value='journey'>Our Journey</TabsTrigger>
              </TabsList>

              {/* Mission Tab */}
              <TabsContent value='mission'>
                <Card>
                  <CardContent className='pt-6'>
                    <motion.div
                      variants={containerVariants}
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true }}
                      className='grid grid-cols-1 md:grid-cols-2 gap-8'
                    >
                      <motion.div variants={itemVariants} className='space-y-4'>
                        <h3 className='text-2xl font-bold font-serif'>
                          Our Vision
                        </h3>
                        <p className='leading-relaxed'>
                          At VibrantVista, we envision a digital space where
                          diverse voices are amplified, where readers can
                          discover content that informs, inspires, and
                          entertains.
                        </p>
                        <p className='leading-relaxed'>
                          We believe in the power of storytelling to connect
                          people, spark conversations, and drive positive change
                          in the world.
                        </p>
                      </motion.div>

                      <motion.div variants={itemVariants} className='space-y-4'>
                        <h3 className='text-2xl font-bold font-serif'>
                          Our Values
                        </h3>
                        <ul className='space-y-3'>
                          <li className='flex items-center gap-3'>
                            <span className='w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm'>
                              1
                            </span>
                            <span className='font-medium'>
                              Quality over quantity
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <span className='w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm'>
                              2
                            </span>
                            <span className='font-medium'>
                              Diversity of perspectives
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <span className='w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm'>
                              3
                            </span>
                            <span className='font-medium'>
                              Integrity in reporting
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <span className='w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm'>
                              4
                            </span>
                            <span className='font-medium'>
                              Community engagement
                            </span>
                          </li>
                          <li className='flex items-center gap-3'>
                            <span className='w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm'>
                              5
                            </span>
                            <span className='font-medium'>
                              Innovation in storytelling
                            </span>
                          </li>
                        </ul>
                      </motion.div>
                    </motion.div>

                    {/* Quote */}
                    <motion.div
                      variants={itemVariants}
                      className='mt-12 bg-muted/30 p-6 rounded-lg border border-border'
                    >
                      <blockquote className='text-lg italic text-muted-foreground'>
                        "Our goal is to create content that not only informs but
                        transforms—stories that stay with you long after you've
                        finished reading them."
                        <footer className='mt-4 font-medium not-italic text-foreground'>
                          — Sai Vivek Varma, Founder
                        </footer>
                      </blockquote>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value='team'>
                <Card>
                  <CardContent className='pt-6'>
                    <motion.div
                      variants={containerVariants}
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true }}
                      className='grid grid-cols-1 md:grid-cols-1 gap-8'
                    >
                      {teamMembers.map((member, index) => (
                        <motion.div
                          key={member.name}
                          variants={itemVariants}
                          whileHover={{ y: -5 }}
                          className='flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-card p-4 rounded-lg border border-border'
                        >
                          <Avatar className='w-20 h-20'>
                            <AvatarImage src={member.image} alt={member.name} />
                            <AvatarFallback>
                              {member.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className='text-center sm:text-left'>
                            <h3 className='font-bold text-lg'>{member.name}</h3>
                            <p className='text-primary text-sm mb-2'>
                              {member.role}
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              {member.bio}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Join Us */}
                    <motion.div
                      variants={itemVariants}
                      className='mt-12 text-center'
                    >
                      <h3 className='text-xl font-bold mb-4'>
                        Want to Join Our Team?
                      </h3>
                      <p className='text-muted-foreground mb-6'>
                        We're always looking for talented writers and editors to
                        join our growing team.
                      </p>
                      <a
                        href='/careers'
                        className='inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 transition'
                      >
                        View Open Positions
                      </a>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Journey Tab */}
              <TabsContent value='journey'>
                <Card>
                  <CardContent className='pt-6'>
                    <motion.div
                      variants={containerVariants}
                      initial='hidden'
                      whileInView='visible'
                      viewport={{ once: true }}
                      className='space-y-12'
                    >
                      {/* Timeline */}
                      <div className='relative border-l-2 border-muted ml-4 pl-8 py-4 space-y-12'>
                        {timelineItems.map((item, index) => (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                            className='relative'
                          >
                            <span className='absolute -left-[2.85rem] w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-sm'>
                              {index + 1}
                            </span>
                            <div className='bg-card p-4 rounded-lg border border-border'>
                              <span className='text-sm text-secondary font-medium'>
                                {item.year}
                              </span>
                              <h3 className='font-bold text-lg mt-1'>
                                {item.title}
                              </h3>
                              <p className='text-muted-foreground mt-2'>
                                {item.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Stats */}
                      <motion.div
                        variants={containerVariants}
                        className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-12'
                      >
                        <motion.div
                          variants={itemVariants}
                          className='text-center p-4 rounded-lg bg-muted/30'
                        >
                          <span className='text-3xl font-bold text-primary block'>
                            50+
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            Contributors
                          </span>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className='text-center p-4 rounded-lg bg-muted/30'
                        >
                          <span className='text-3xl font-bold text-primary block'>
                            500+
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            Articles
                          </span>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className='text-center p-4 rounded-lg bg-muted/30'
                        >
                          <span className='text-3xl font-bold text-primary block'>
                            100k+
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            Monthly Readers
                          </span>
                        </motion.div>
                        <motion.div
                          variants={itemVariants}
                          className='text-center p-4 rounded-lg bg-muted/30'
                        >
                          <span className='text-3xl font-bold text-primary block'>
                            10+
                          </span>
                          <span className='text-sm text-muted-foreground'>
                            Categories
                          </span>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
