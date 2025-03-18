"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Upload,
  Share2,
  Shield,
  Clock,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
// import { trpc } from "./utils/trpc";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { SignUpButton } from "@clerk/nextjs";
import SimpleMultipartUpload from "./components/file-upload";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-background to-muted">
          <div className="container mx-auto">
            <motion.div
              className="max-w-3xl mx-auto text-center space-y-6"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                variants={itemVariants}
              >
                Preserve & Share <span className="text-primary">Memories</span>
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-muted-foreground"
                variants={itemVariants}
              >
                Upload, share, and safeguard your important files with just a
                few clicks. Your digital memories, secured forever.
              </motion.p>

              <motion.div variants={itemVariants}>
                <SimpleMultipartUpload />
              </motion.div>
            </motion.div>
          </div>
        </section>
        {/* Features Section */}
        <section id="features" className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Powerful Features
              </h2>
              <p className="text-lg text-muted-foreground">
                Everything you need to preserve and share your memories with
                confidence
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Upload />,
                  title: "Easy Uploads",
                  description:
                    "Drag & drop or select files to upload instantly with no size limits on paid plans.",
                },
                {
                  icon: <Share2 />,
                  title: "Simple Sharing",
                  description:
                    "Generate shareable links with optional password protection and expiration dates.",
                },
                {
                  icon: <Shield />,
                  title: "Secure Storage",
                  description:
                    "All files are encrypted at rest and during transfer for maximum security.",
                },
                {
                  icon: <Clock />,
                  title: "Lifetime Access",
                  description:
                    "Your memories are preserved forever with our premium plans.",
                },
                {
                  icon: <CheckCircle />,
                  title: "Delivery Confirmation",
                  description:
                    "Get notified when your files are downloaded by recipients.",
                },
                {
                  icon: <Upload />,
                  title: "Bulk Uploads",
                  description:
                    "Upload multiple files at once and organize them into collections.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="py-20 px-4 md:px-6 lg:px-8 bg-muted"
        >
          <div className="container mx-auto">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground">
                Preserving your memories has never been easier. Just three
                simple steps.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting Line */}
              <div className="hidden md:block absolute top-1/4 left-0 right-0 h-0.5 bg-border" />

              {[
                {
                  step: "01",
                  title: "Upload Your Files",
                  description:
                    "Drag & drop your files or select them from your device.",
                },
                {
                  step: "02",
                  title: "Configure Sharing Options",
                  description:
                    "Set passwords, expiration dates, and access controls if needed.",
                },
                {
                  step: "03",
                  title: "Share the Link",
                  description:
                    "Copy the generated link and share it with anyone you want.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative bg-card rounded-xl p-6 border shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold mb-4 z-10 relative"
                    whileHover={{ scale: 1.1 }}
                  >
                    {item.step}
                  </motion.div>
                  <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 md:px-6 lg:px-8">
          <div className="container mx-auto">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Simple Pricing
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose the plan that fits your memory preservation needs. No
                hidden fees.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Free",
                  price: "$0",
                  description: "Perfect for occasional sharing",
                  features: [
                    "2GB storage limit",
                    "Files expire after 7 days",
                    "Basic sharing options",
                    "100MB max file size",
                    "Email support",
                  ],
                  cta: "Get Started",
                  popular: false,
                },
                {
                  name: "Pro",
                  price: "$9.99",
                  period: "/month",
                  description: "For individuals who share regularly",
                  features: [
                    "50GB storage limit",
                    "Files never expire",
                    "Password protection",
                    "2GB max file size",
                    "Priority support",
                    "Download tracking",
                  ],
                  cta: "Start Free Trial",
                  popular: true,
                },
                {
                  name: "Business",
                  price: "$29.99",
                  period: "/month",
                  description: "For teams and businesses",
                  features: [
                    "500GB storage limit",
                    "Files never expire",
                    "Advanced security options",
                    "10GB max file size",
                    "24/7 priority support",
                    "Team management",
                    "API access",
                  ],
                  cta: "Contact Sales",
                  popular: false,
                },
              ].map((plan, index) => (
                <motion.div
                  key={index}
                  className={`relative rounded-xl p-6 border shadow-sm ${
                    plan.popular ? "border-primary shadow-md" : ""
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      {plan.period && (
                        <span className="text-muted-foreground ml-1">
                          {plan.period}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mt-2">
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 bg-primary text-primary-foreground">
          <div className="container mx-auto">
            <motion.div
              className="max-w-3xl mx-auto text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to preserve your memories?
              </h2>
              <p className="text-lg opacity-90">
                Join thousands of users who trust Memoire for their file sharing
                and preservation needs.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                whileHover={{ scale: 1.02 }}
              >
                <SignUpButton>
                  <Button
                    className="cursor-pointer"
                    size="lg"
                    variant="secondary"
                  >
                    Try For Free
                  </Button>
                </SignUpButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent cursor-pointer"
                >
                  <Link href="/docs" className="flex items-center">
                    Learn More <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 md:px-6 lg:px-8 border-t">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            <div className="col-span-2 lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                {/* <MemoireLogo className="h-6 w-auto" /> */}
                <span className="text-lg font-bold">Memoire</span>
              </Link>
              <p className="text-muted-foreground mb-4 max-w-xs">
                The simplest way to preserve and share your memories. Secure,
                fast, and reliable.
              </p>
              <div className="flex space-x-4">
                {["twitter", "facebook", "instagram", "github"].map(
                  (social) => (
                    <Link
                      key={social}
                      href={`#${social}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <Image
                          src={`/placeholder.svg?height=16&width=16`}
                          alt={social}
                          width={16}
                          height={16}
                        />
                      </div>
                    </Link>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-3">
                {["Features", "Pricing", "Security", "Changelog"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-3">
                {["About", "Careers", "Blog", "Legal"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Support</h3>
              <ul className="space-y-3">
                {["Help Center", "Contact", "Status", "Documentation"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Memoire. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
